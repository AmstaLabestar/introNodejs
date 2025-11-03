// src/models/comment.model.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: { 
      type: String, 
      required: [true, 'Le contenu du commentaire est obligatoire'],
      trim: true,
      minlength: 2,
      maxlength: 500
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
