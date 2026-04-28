const express = require('express');
const router = express.Router();

const postsRoutes = require('./posts');
const authRoutes = require('./auth');

router.use('/posts', postsRoutes);
router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

module.exports = router;