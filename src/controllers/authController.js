const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return res.status(400).json({
                error: 'User with this email or username already exists'
            });
        }
        
        const user = new User({ username, email, password });
        
        await user.save();
        
        const token = generateToken(user._id);
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ errors: messages });
        }
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }
        
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = generateToken(user._id);
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
        
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
        
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe };