const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Récupérer les notifications de l'utilisateur (paginées)
exports.getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Récupérer les notifications
    const [notifications, totalCount] = await Promise.all([
      Notification.find({ recipient: currentUserId })
        .populate('sender', 'username email')
        .populate('messageId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: currentUserId })
    ]);

    // Compter les notifications non lues
    const unreadCount = await Notification.countDocuments({
      recipient: currentUserId,
      isRead: false
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      unreadTotal: unreadCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Marquer une notification comme lue
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const currentUserId = req.user.id;

    // Récupérer la notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (notification.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Marquer comme lue
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      data: notification
    });
  } catch (error) {
    console.error('Erreur lors de la marque comme lue:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Marquer toutes les notifications comme lues
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Marquer toutes comme lues
    await Notification.updateMany(
      { recipient: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Erreur lors de la marque comme lue:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Supprimer une notification
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const currentUserId = req.user.id;

    // Récupérer la notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (notification.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Supprimer la notification
    await Notification.findByIdAndDelete(notificationId);

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupérer le statut en ligne des utilisateurs
exports.getUsersOnlineStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Récupérer le statut en ligne de tous les utilisateurs
    const users = await User.find().select('username email isOnline lastSeen');

    const onlineStatus = {};
    users.forEach(user => {
      if (user._id.toString() !== currentUserId) {
        onlineStatus[user._id] = {
          username: user.username,
          email: user.email,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen
        };
      }
    });

    res.status(200).json({
      success: true,
      data: onlineStatus
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};
