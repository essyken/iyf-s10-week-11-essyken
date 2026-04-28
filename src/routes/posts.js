const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const commentsController = require('../controllers/commentsController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes
router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

// Protected routes
router.post('/', protect, postsController.createPost);
router.put('/:id', protect, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);
router.patch('/:id/like', postsController.likePost);

// Admin only
router.delete('/:id/force', protect, restrictTo('admin'), postsController.deletePost);

// Comment routes nested under posts
router.get('/:postId/comments', commentsController.getComments);
router.post('/:postId/comments', protect, commentsController.createComment);
router.delete('/:postId/comments/:commentId', protect, commentsController.deleteComment);

module.exports = router;