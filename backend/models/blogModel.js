// models/blogModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Links the post to the user who wrote it
    required: true
  },
  tags: [{ 
    type: String // e.g., "Help", "Showcase", "Tips"
  }],
  
  // --- MODERATION FIELDS ---
  isFlagged: {
    type: Boolean,
    default: false
  },
  flaggedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User' // Keeps track of who reported it so they can't spam the report button
  }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);