const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB :', err.message);
    process.exit(1); // on arrête l'app seulement en cas d'erreur
  }
};

module.exports = connectDB;
