const Post = require('../models/Post');

const getAllPosts = async (req, res, next) => {
    try {
        const { search, sort, page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            query.$text = { $search: search };
        }

        let sortOption = { createdAt: -1 };

        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'popular') {
            sortOption = { likes: -1 };
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find(query)
            .populate('author', 'username')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username email');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid post ID' });
        }
        next(error);
    }
};

const createPost = async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;

        const post = new Post({
            title,
            content,
            author: req.user._id,
            tags
        });

        await post.save();

        await post.populate('author', 'username email');

        res.status(201).json(post);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ errors: messages });
        }
        next(error);
    }
};

const updatePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check ownership
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'You can only edit your own posts'
            });
        }

        const { title, content, tags } = req.body;
        post.title = title || post.title;
        post.content = content || post.content;
        post.tags = tags || post.tags;

        await post.save();

        res.json(post);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check ownership
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'You can only delete your own posts'
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await post.like();

        res.json(post);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    likePost
};