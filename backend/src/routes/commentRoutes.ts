import express from 'express';
import {
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
  getCommentsByUser
} from '../controllers/commentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Comment routes
router.get('/user/:userId', getCommentsByUser);              // GET /api/comments/user/:userId - Get comments by user
router.put('/:id', authMiddleware, updateComment);           // PUT /api/comments/:id - Update comment (author only)
router.delete('/:id', authMiddleware, deleteComment);        // DELETE /api/comments/:id - Delete comment (author only)

// Voting routes
router.post('/:id/upvote', authMiddleware, upvoteComment);   // POST /api/comments/:id/upvote - Upvote comment (auth required)
router.post('/:id/downvote', authMiddleware, downvoteComment); // POST /api/comments/:id/downvote - Downvote comment (auth required)

export default router;
