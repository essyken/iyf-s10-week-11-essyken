const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        minlength: [10, 'Content must be at least 10 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    published: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Virtual populate for comments
postSchema.virtual('commentList', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post'
});

postSchema.set('toJSON', { virtuals: true });

postSchema.index({ title: 'text', content: 'text' });

postSchema.methods.like = function() {
    this.likes++;
    return this.save();
};

postSchema.statics.findByAuthor = function(author) {
    return this.find({ author: new RegExp(author, 'i') });
};

module.exports = mongoose.model('Post', postSchema);