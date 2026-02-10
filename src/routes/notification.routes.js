const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUsersOnlineStatus
} = require('../controllers/notification.controller');

// Routes des notifications (protégées)
router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markNotificationAsRead);
router.patch('/read-all', verifyToken, markAllNotificationsAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Statut en ligne des utilisateurs
router.get('/online-status', verifyToken, getUsersOnlineStatus);

module.exports = router;
