const express = require('express');
const router = express.Router();
const {
  getUsers,
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Routes publiques
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes protégées
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, updateUser);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
