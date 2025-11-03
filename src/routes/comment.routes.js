const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const {
  createComment,
  getComments,
  getCommentById,
  deleteComment,
  updateComment
} = require('../controllers/comment.controller');

// 🔹 Routes publiques
router.get('/', getComments);
router.get('/:id', getCommentById);

// 🔹 Routes privées (auth requise)
router.post('/', verifyToken, createComment);
router.put('/:id', verifyToken, updateComment);
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
