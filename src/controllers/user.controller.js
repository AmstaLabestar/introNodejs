const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

//  Enregistrement d’un utilisateur
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Vérification des champs obligatoires
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Utilisateur enregistré avec succès',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

//  Connexion d’un utilisateur
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupération de tous les utilisateurs (protégée)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');// on recupères les donnée de tous les users sans le password
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupération d’un utilisateur par ID (protégée)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

//  Mise à jour d'un utilisateur (protégée)
exports.updateUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur ne peut modifier que son propre profil
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre propre profil' });
    }

    const { username, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Suppression d'un utilisateur (protégée)
exports.deleteUser = async (req, res) => {
  try {
    // Vérifier que l'utilisateur ne peut supprimer que son propre compte
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que votre propre compte' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id).select('-password');
    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ message: 'Utilisateur supprimé', user: deletedUser });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Suivre un utilisateur
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Vérifier qu'on n'essaie pas de se suivre soi-même
    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const currentUser = await User.findById(currentUserId);

    // Vérifier si on suit déjà cet utilisateur
    if (currentUser.following.includes(targetUserId)) {
      return res.status(409).json({ message: 'Vous suivez déjà cet utilisateur' });
    }

    // Ajouter à following et followers
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Vous suivez maintenant cet utilisateur',
      following: true,
      followingCount: currentUser.following.length,
      followerCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Erreur lors du suivi de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Arrêter de suivre un utilisateur
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const currentUser = await User.findById(currentUserId);

    // Vérifier si on suit cet utilisateur
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(404).json({ message: 'Vous ne suivez pas cet utilisateur' });
    }

    // Retirer de following et followers
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'Vous avez arrêté de suivre cet utilisateur',
      following: false,
      followingCount: currentUser.following.length,
      followerCount: targetUser.followers.length
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du suivi:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupérer les followers d'un utilisateur avec pagination
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    // Paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer les followers avec pagination
    const [followers, totalCount] = await Promise.all([
      User.find({ _id: { $in: user.followers } })
        .select('-password')
        .skip(skip)
        .limit(limit),
      User.countDocuments({ _id: { $in: user.followers } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: followers,
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
    console.error('Erreur lors de la récupération des followers:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupérer qui suit cet utilisateur (following) avec pagination
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    // Paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer qui on suit avec pagination
    const [following, totalCount] = await Promise.all([
      User.find({ _id: { $in: user.following } })
        .select('-password')
        .skip(skip)
        .limit(limit),
      User.countDocuments({ _id: { $in: user.following } })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: following,
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
    console.error('Erreur lors de la récupération des utilisateurs suivis:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};
