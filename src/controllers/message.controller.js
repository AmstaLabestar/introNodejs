const Message = require('../models/message.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    const senderId = req.user.id;

    // Validation des champs requis
    if (!content || !recipientId) {
      return res.status(400).json({ message: 'Le contenu et le destinataire sont requis' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    // Vérifier que l'utilisateur ne s'envoie pas de message à lui-même
    if (senderId === recipientId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer de message' });
    }

    // Vérifier que le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    // Créer le message
    const message = await Message.create({
      content,
      sender: senderId,
      recipient: recipientId
    });

    // Populate les informations
    await message.populate('sender', 'username email');
    await message.populate('recipient', 'username email');

    // Créer une notification
    await Notification.create({
      type: 'message',
      recipient: recipientId,
      sender: senderId,
      messageId: message._id
    });

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: message
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupérer la conversation avec un utilisateur (paginée)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;

    // Paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 20;

    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer les messages entre les 2 utilisateurs (exclure ceux supprimés pour l'utilisateur actuel)
    const [messages, totalCount] = await Promise.all([
      Message.find({
        $or: [
          { sender: currentUserId, recipient: userId, deletedBySender: false },
          { sender: userId, recipient: currentUserId, deletedByRecipient: false }
        ]
      })
        .populate('sender', 'username email')
        .populate('recipient', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({
        $or: [
          { sender: currentUserId, recipient: userId, deletedBySender: false },
          { sender: userId, recipient: currentUserId, deletedByRecipient: false }
        ]
      })
    ]);

    // Compter les messages non lus
    const unreadCount = await Message.countDocuments({
      sender: userId,
      recipient: currentUserId,
      isRead: false,
      deletedByRecipient: false
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Récupérer la liste des conversations (paginée)
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Paramètres de pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    // Récupérer tous les IDs uniques des utilisateurs avec qui on a échangé des messages
    const conversationUsers = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { recipient: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$recipient',
              '$sender'
            ]
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);

    // Compter le nombre total de conversations
    const totalCount = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { recipient: currentUserId }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$recipient',
              '$sender'
            ]
          }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalCount.length > 0 ? totalCount[0].total : 0;

    // Récupérer les infos des utilisateurs
    const conversations = await Promise.all(
      conversationUsers.map(async (conv) => {
        const user = await User.findById(conv._id).select('username email');
        return {
          userId: user._id,
          username: user.username,
          email: user.email,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const currentUserId = req.user.id;

    // Récupérer le message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Non autorisé à marquer ce message comme lu' });
    }

    // Marquer comme lu
    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    // Marquer la notification comme lue
    await Notification.findOneAndUpdate(
      { messageId: messageId },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: 'Message marqué comme lu',
      data: message
    });
  } catch (error) {
    console.error('Erreur lors de la marque comme lu:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Supprimer un message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const currentUserId = req.user.id;

    // Récupérer le message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
    if (message.sender.toString() !== currentUserId && message.recipient.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que votre propre message' });
    }

    // Soft delete selon le rôle de l'utilisateur
    if (message.sender.toString() === currentUserId) {
      message.deletedBySender = true;
    } else {
      message.deletedByRecipient = true;
    }

    // Si supprimé par les deux, supprimer vraiment
    if (message.deletedBySender && message.deletedByRecipient) {
      await Message.findByIdAndDelete(messageId);
    } else {
      await message.save();
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};
