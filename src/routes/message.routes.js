const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { sendMessage: sendMessageSchema } = require('../validations/schemas');
const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  deleteMessage
} = require('../controllers/message.controller');

// Routes des messages (protégées)
router.post('/', verifyToken, validate(sendMessageSchema), sendMessage);
router.get('/:userId', verifyToken, getMessages);
router.get('/', verifyToken, getConversations);
router.patch('/:id/read', verifyToken, markAsRead);
router.delete('/:id', verifyToken, deleteMessage);

module.exports = router;
