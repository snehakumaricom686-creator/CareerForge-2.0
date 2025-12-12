const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a resume title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    // Original uploaded resume file (if uploaded)
    originalFile: {
        url: { type: String, default: null },
        publicId: { type: String, default: null },
        filename: { type: String, default: null }
    },
    personalInfo: {
        fullName: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        linkedIn: { type: String, default: '' },
        portfolio: { type: String, default: '' },
        github: { type: String, default: '' },
        summary: { type: String, default: '' }
    },
    education: [{
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        grade: { type: String, default: '' },
        description: { type: String, default: '' }
    }],
    experience: [{
        company: { type: String, required: true },
        position: { type: String, required: true },
        location: { type: String, default: '' },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, default: '' },
        achievements: [{ type: String }]
    }],
    skills: [{
        name: { type: String, required: true },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Intermediate'
        }
    }],
    projects: [{
        name: { type: String, required: true },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        link: { type: String, default: '' },
        github: { type: String, default: '' }
    }],
    certifications: [{
        name: { type: String, required: true },
        issuer: { type: String, default: '' },
        date: { type: Date },
        expiryDate: { type: Date },
        link: { type: String, default: '' },
        credentialId: { type: String, default: '' }
    }],
    languages: [{
        name: { type: String, required: true },
        proficiency: {
            type: String,
            enum: ['Basic', 'Conversational', 'Fluent', 'Native'],
            default: 'Conversational'
        }
    }],
    template: {
        type: String,
        enum: ['modern', 'classic', 'minimal', 'professional', 'creative'],
        default: 'modern'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    // Share settings
    shareToken: {
        type: String,
        default: null
    },
    shareExpiry: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ shareToken: 1 });

// Generate share token
resumeSchema.methods.generateShareToken = function () {
    const crypto = require('crypto');
    this.shareToken = crypto.randomBytes(32).toString('hex');
    this.shareExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    return this.shareToken;
};

module.exports = mongoose.model('Resume', resumeSchema);
