const Comment = require('../models/comment.model');

// ✅ Ajouter un commentaire
exports.createComment = async (req, res) => {
  try {
    const { content, author, post } = req.body; // author au lieu de user

    if (!content || !author || !post) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const comment = await Comment.create({ content, author, post });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Erreur serveur createComment:', error);
    res.status(500).json({ message: 'Erreur lors de la création du commentaire', error: error.message });
  }
};


// ✅ Récupérer tous les commentaires
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name email') // affiche seulement le nom et l'email de l'utilisateur
      .populate('post', 'title'); // adapte selon ton modèle de post
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
  }
};

// ✅ Récupérer un commentaire par ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('post', 'title');

    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du commentaire', error: error.message });
  }
};

// ✅ Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });

    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    await comment.remove();
    res.status(200).json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// 🔹 Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });

    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    comment.content = req.body.content || comment.content;
    await comment.save();

    res.status(200).json({ message: 'Commentaire mis à jour', comment });
  } catch (error) {
    console.error('Erreur serveur updateComment:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


