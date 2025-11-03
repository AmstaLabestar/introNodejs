const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/user.routes'); // auth
const commentRoutes = require('./routes/comment.routes');
const postRoutes = require('./routes/post.routes');
const cors = require('cors');
dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5501',
    credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);     // pour register/login
app.use('/api/comments', commentRoutes);
app.use('/api/posts', postRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app;
