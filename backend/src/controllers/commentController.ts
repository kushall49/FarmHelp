import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';

// @desc    Get all comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username displayName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// @desc    Create a comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
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

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create comment
    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
      upvotes: [],
      downvotes: []
    });

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate author info
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username displayName email');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: populatedComment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (author only)
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    comment.text = text;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username displayName email');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: updatedComment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating comment',
      error: error.message
    });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (author only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// @desc    Upvote a comment
// @route   POST /api/comments/:id/upvote
// @access  Private
export const upvoteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove from downvotes if present
    const downvoteIndex = comment.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: upvoteIndex > -1 ? 'Upvote removed' : 'Comment upvoted',
      data: {
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        netVotes: comment.upvotes.length - comment.downvotes.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error upvoting comment',
      error: error.message
    });
  }
};

// @desc    Downvote a comment
// @route   POST /api/comments/:id/downvote
// @access  Private
export const downvoteComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Remove from upvotes if present
    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
    const downvoteIndex = comment.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    } else {
      comment.downvotes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: downvoteIndex > -1 ? 'Downvote removed' : 'Comment downvoted',
      data: {
        upvotes: comment.upvotes.length,
        downvotes: comment.downvotes.length,
        netVotes: comment.upvotes.length - comment.downvotes.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error downvoting comment',
      error: error.message
    });
  }
};

// @desc    Get comments by user
// @route   GET /api/comments/user/:userId
// @access  Public
export const getCommentsByUser = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({ author: req.params.userId })
      .populate('author', 'username displayName email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments,
      count: comments.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user comments',
      error: error.message
    });
  }
};
