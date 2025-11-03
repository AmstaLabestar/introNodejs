// routes/post.routes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  toggleLike,
  getUserPosts,
  updatePost
} = require('../controllers/post.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// 🔹 Routes publiques
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/user/:userId', getUserPosts);

// 🔹 Routes privées (auth requise)
router.post('/', verifyToken, createPost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, toggleLike);
router.put('/:id', verifyToken, updatePost);


module.exports = router;
