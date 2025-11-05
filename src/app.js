const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/user.routes'); // auth
const commentRoutes = require('./routes/comment.routes');
const postRoutes = require('./routes/post.routes');
dotenv.config();



// app.use('/uploads', express.static('uploads'));


// app.use('/api/auth', authRoutes);     // pour register/login
// app.use('/api/comments', commentRoutes);
// app.use('/api/posts', postRoutes);



const app = express();

// CORS en premier
app.use(cors({
    origin: 'http://127.0.0.1:5501',
    credentials: true,
}));

// Parse JSON
app.use(express.json());

// Servir les fichiers statiques AVANT les routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/posts', postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app;
