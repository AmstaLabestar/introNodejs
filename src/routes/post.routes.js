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
const validate = require('../middlewares/validate.middleware');
const { createPost: createPostSchema, updatePost: updatePostSchema } = require('../validations/schemas');
const upload = require('../middlewares/upload.middleware');

// Routes publiques
router.get('/', getPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPostById);

// Routes privées (authentification requise)
router.post('/', verifyToken, upload.single('image'), validate(createPostSchema), createPost);
router.put('/:id', verifyToken, upload.single('image'), validate(updatePostSchema), updatePost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, toggleLike);

module.exports = router;