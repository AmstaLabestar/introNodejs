const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

// Connexion à la base de données
connectDB();

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Serveur démarré sur le port ${PORT}`));
