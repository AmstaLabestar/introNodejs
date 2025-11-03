const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user.routes');

dotenv.config();

const app = express();

// ======================================================
// 🧩 MIDDLEWARES
// ======================================================
app.use(express.json()); // pour lire le JSON envoyé dans le body

// ======================================================
// 🧭 ROUTES PRINCIPALES
// ======================================================
app.use('/api/users', userRoutes);

// ======================================================
// 🚧 GESTION DES ERREURS 404
// ======================================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app;
