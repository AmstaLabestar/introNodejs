const Comment = require('../models/comment.model');

// Ajouter un commentaire
exports.createComment = async (req, res) => {
  try {
    const { content, post } = req.body;

    if (!content || !post) {
      return res.status(400).json({ message: 'Le contenu et le post sont requis.' });
    }

    const comment = await Comment.create({ content, author: req.user.id, post });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Erreur serveur createComment:', error);
    res.status(500).json({ message: 'Erreur lors de la création du commentaire', error: error.message });
  }
};


// Récupérer tous les commentaires avec pagination
exports.getComments = async (req, res) => {
  try {
    // Récupérer et valider les paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Récupérer les commentaires et le nombre total
    const [comments, totalCount] = await Promise.all([
      Comment.find()
        .populate('author', 'username email')
        .populate('post', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires', error: error.message });
  }
};

// Récupérer un commentaire par ID
exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username email')
      .populate('post', 'title');

    if (!comment) return res.status(404).json({ message: 'Commentaire non trouvé' });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du commentaire', error: error.message });
  }
};

// Supprimer un commentaire

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifie le format de l'ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    // Vérifie que l'utilisateur est bien l'auteur
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer ce commentaire" });
    }

    await comment.deleteOne();

    return res.status(204).send();
  } catch (error) {
    console.error("Erreur suppression commentaire :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour un commentaire
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


