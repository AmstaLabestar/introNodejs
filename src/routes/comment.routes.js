const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createComment: createCommentSchema, updateComment: updateCommentSchema } = require('../validations/schemas');
const {
  createComment,
  getComments,
  getCommentById,
  deleteComment,
  updateComment
} = require('../controllers/comment.controller');

// Routes publiques
router.get('/', getComments);
router.get('/:id', getCommentById);

// Routes privées (auth requise)
router.post('/', verifyToken, validate(createCommentSchema), createComment);
router.put('/:id', verifyToken, validate(updateCommentSchema), updateComment);
router.delete('/:id', verifyToken, deleteComment);

module.exports = router;
