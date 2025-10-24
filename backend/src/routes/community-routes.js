const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Import models (we'll need JS versions)
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// ============= POST ROUTES =============

// Get all posts (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username displayName email avatar location bio')
      .populate({
        path: 'comments',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'username displayName avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username displayName email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username displayName' },
        options: { sort: { createdAt: -1 } }
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
});

// Create post (auth required) - with image upload support
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('📝 POST /api/community - Creating new post');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);
    console.log('Authenticated user:', req.user);

    const { title, content } = req.body;
    const userId = req.user?.userId || req.user?.id;

    // Validation: User authentication
    if (!userId) {
      console.error('❌ Authentication failed - No userId found');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please login again.'
      });
    }

    // Validation: Required fields
    if (!title || !content) {
      console.error('❌ Validation failed - Missing title or content');
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
        errors: {
          title: !title ? 'Title is required' : null,
          content: !content ? 'Content is required' : null
        }
      });
    }

    // Validation: Title length
    if (title.trim().length < 3) {
      console.error('❌ Validation failed - Title too short');
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long'
      });
    }

    // Validation: Content length
    if (content.trim().length < 10) {
      console.error('❌ Validation failed - Content too short');
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters long'
      });
    }

    // Get image URL from Cloudinary if uploaded
    const imageUrl = req.file ? req.file.path : '';
    console.log('📸 Image URL:', imageUrl || 'No image uploaded');

    // Create post
    console.log('💾 Creating post in database...');
    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      imageUrl,
      author: userId,
      comments: [],
      upvotes: [],
      downvotes: []
    });

    console.log('✅ Post created with ID:', post._id);

    // Populate author details
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName email avatar location bio farmSize expertise');

    console.log('✅ Post populated successfully');
    console.log('📤 Sending response...');

    res.status(201).json({
      success: true,
      message: 'Post created successfully! 🎉',
      data: populatedPost
    });

  } catch (error) {
    console.error('❌ ERROR in POST /api/community:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        details: error.errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: error.message
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to create post. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update post (author only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.userId || req.user?.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts'
      });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName email');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
});

// Delete post (author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
});

// Upvote post
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Post upvoted',
      data: {
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        netVotes: post.upvotes.length - post.downvotes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error upvoting post',
      error: error.message
    });
  }
});

// Downvote post
router.post('/:id/downvote', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    }

    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: downvoteIndex > -1 ? 'Downvote removed' : 'Post downvoted',
      data: {
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        netVotes: post.upvotes.length - post.downvotes.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downvoting post',
      error: error.message
    });
  }
});

// ============= COMMENT ROUTES =============

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username displayName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

// Create comment
router.post('/:postId/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user?.userId || req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
      upvotes: [],
      downvotes: []
    });

    post.comments.push(comment._id);
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username displayName email');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
});

// Get posts by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId })
      .populate('author', 'username displayName email avatar location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: userId });

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
});

module.exports = router;
