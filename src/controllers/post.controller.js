const Post = require('../models/post.model');
const Comment = require('../models/comment.model');

// 🔹 Créer un post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Le contenu du post est obligatoire' });
    }

    const newPost = await Post.create({
      content,
      user: req.user.id
    });

    await newPost.populate('user', 'username email');

    res.status(201).json({
      message: 'Post créé avec succès',
      post: newPost
    });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Récupérer tous les posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'username email')
      .populate({
        path: 'likes',
        select: 'username'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Récupérer un post par ID avec ses commentaires
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username email')
      .populate({
        path: 'likes',
        select: 'username'
      });

    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      post,
      comments,
      likesCount: post.likes.length,
      commentsCount: comments.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Supprimer un post (seulement le propriétaire)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: 'Accès refusé. Vous ne pouvez supprimer que vos propres posts.' 
      });
    }

    await Comment.deleteMany({ post: req.params.id });
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      message: 'Post et commentaires associés supprimés avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Liker / Unliker un post
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      await post.save();

      return res.status(200).json({
        message: 'Like retiré',
        liked: false,
        likesCount: post.likes.length
      });
    } else {
      post.likes.push(userId);
      await post.save();

      return res.status(200).json({
        message: 'Post liké',
        liked: true,
        likesCount: post.likes.length
      });
    }
  } catch (error) {
    console.error('Erreur lors du like/unlike:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Récupérer les posts d'un utilisateur spécifique
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username email')
      .populate({
        path: 'likes',
        select: 'username'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: posts.length,
      posts
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des posts utilisateur:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// 🔹 Mettre à jour un post
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post non trouvé' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    post.content = req.body.content || post.content;
    await post.save();

    res.status(200).json({ message: 'Post mis à jour', post });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
