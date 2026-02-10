const express = require('express');
const router = express.Router();
const {
  getUsers,
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { register, login, updateUser: updateUserSchema } = require('../validations/schemas');

// Routes publiques
router.post('/register', validate(register), registerUser);
router.post('/login', validate(login), loginUser);

// Routes protégées
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, validate(updateUserSchema), updateUser);
router.delete('/:id', verifyToken, deleteUser);

// Routes Follow/Followers
router.post('/:id/follow', verifyToken, followUser);
router.delete('/:id/follow', verifyToken, unfollowUser);
router.get('/:id/followers', verifyToken, getFollowers);
router.get('/:id/following', verifyToken, getFollowing);

module.exports = router;
