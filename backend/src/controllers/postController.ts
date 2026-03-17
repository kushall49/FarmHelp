import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('author', 'username displayName email')
      .populate({
        path: 'comments',
        options: { limit: 3, sort: { createdAt: -1 } },
        populate: { path: 'author', select: 'username displayName' }
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req: Request, res: Response) => {
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

    res.json({
      success: true,
      data: post
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (requires auth)
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const post = await Post.create({
      title,
      content,
      author: userId,
      comments: [],
      upvotes: [],
      downvotes: []
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username displayName email');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private (author only)
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating post',
      error: error.message
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private (author only)
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: post._id });

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// @desc    Upvote a post
// @route   POST /api/posts/:id/upvote
// @access  Private
export const upvotePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Remove from downvotes if present
    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error upvoting post',
      error: error.message
    });
  }
};

// @desc    Downvote a post
// @route   POST /api/posts/:id/downvote
// @access  Private
export const downvotePost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Remove from upvotes if present
    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error downvoting post',
      error: error.message
    });
  }
};

// @desc    Get posts by user
// @route   GET /api/posts/user/:userId
// @access  Public
export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username displayName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message
    });
  }
};
