// routes/blog.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  getBlogs,
  createBlog,
  flagBlog,
  deleteBlog,
  getFlaggedBlogs,
  replyToBlog   
} = require('../controllers/blogController');

// Require auth for all blog routes (Guests can't read/write to the community board)
router.use(requireAuth);

// Regular User Routes
router.get('/', getBlogs);           // Fetch feed
router.post('/', createBlog);        // Create a post
router.patch('/:id/flag', flagBlog); // Report a post
router.delete('/:id', deleteBlog);   // Delete a post (Controller checks permissions)
router.post('/:id/reply', replyToBlog); // Add a reply to a post

// Admin Specific Routes
router.get('/admin/flagged', getFlaggedBlogs); // View moderation queue

module.exports = router;