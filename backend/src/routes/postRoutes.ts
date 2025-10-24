import express from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  downvotePost,
  getPostsByUser
} from '../controllers/postController';
import { getCommentsByPost, createComment } from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Post routes
router.get('/', getAllPosts);                             // GET /api/posts - Get all posts (paginated)
router.get('/user/:userId', getPostsByUser);              // GET /api/posts/user/:userId - Get posts by user
router.get('/:id', getPostById);                          // GET /api/posts/:id - Get single post
router.post('/', authMiddleware, createPost);             // POST /api/posts - Create new post (auth required)
router.put('/:id', authMiddleware, updatePost);           // PUT /api/posts/:id - Update post (author only)
router.delete('/:id', authMiddleware, deletePost);        // DELETE /api/posts/:id - Delete post (author only)

// Voting routes
router.post('/:id/upvote', authMiddleware, upvotePost);   // POST /api/posts/:id/upvote - Upvote post (auth required)
router.post('/:id/downvote', authMiddleware, downvotePost); // POST /api/posts/:id/downvote - Downvote post (auth required)

// Comment routes (nested under posts)
router.get('/:postId/comments', getCommentsByPost);       // GET /api/posts/:postId/comments - Get all comments
router.post('/:postId/comments', authMiddleware, createComment); // POST /api/posts/:postId/comments - Create comment (auth required)

export default router;
