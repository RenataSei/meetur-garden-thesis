// controllers/blogController.js
const Blog = require('../models/blogModel');
const mongoose = require('mongoose');

// 1. GET ALL BLOGS (The Community Feed)
const getBlogs = async (req, res) => {
  try {
    // Fetch all blogs, newest first, and populate the author's email so we can display it
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'email') // Only fetch the email field from the User model
      .populate('replies.author', 'email'); // 🟢 Fetch emails for repliers!
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREATE A NEW BLOG POST
const createBlog = async (req, res) => {
  const { title, content, tags, image } = req.body;
    
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const blog = await Blog.create({
      title,
      content,
      tags: tags || [],
      author: req.user._id // Automatically grab the logged-in user's ID
    });

    // Populate author before sending back so the UI can render it immediately
    await blog.populate('author', 'email');

    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const replyToBlog = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Reply text is required." });

  try {
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $push: { replies: { author: req.user._id, text: text } } },
      { new: true }
    )
    .populate('author', 'email')
    .populate('replies.author', 'email');

    if (!blog) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 3. FLAG A POST (User reports inappropriate content)
const flagBlog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such blog post" });
  }

  try {
    // $addToSet ensures a user can only flag a post once
    const blog = await Blog.findByIdAndUpdate(
      id,
      { 
        isFlagged: true,
        $addToSet: { flaggedBy: req.user._id } 
      },
      { new: true }
    ).populate('author', 'email');

    if (!blog) {
      return res.status(404).json({ error: "No such blog post" });
    }

    res.status(200).json({ message: "Post flagged for admin review.", blog });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 4. DELETE A POST (Admin OR Author)
const deleteBlog = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such blog post" });
  }

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: "No such blog post" });
    }

    // 🟢 SECURITY CHECK: Only allow deletion if user is Admin OR the original Author
    if (req.user.role !== 'admin' && blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You do not have permission to delete this post." });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully", deletedId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. ADMIN ONLY: GET FLAGGED POSTS
const getFlaggedBlogs = async (req, res) => {
  // Extra layer of protection just in case
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied." });
  }

  try {
    const flaggedBlogs = await Blog.find({ isFlagged: true })
      .sort({ updatedAt: -1 })
      .populate('author', 'email');

    res.status(200).json(flaggedBlogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  flagBlog,
  deleteBlog,
  getFlaggedBlogs,
  replyToBlog
};