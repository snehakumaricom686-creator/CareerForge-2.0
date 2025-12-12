const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: function () {
            // Password not required for OAuth users
            return !this.authProvider;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    profilePicture: {
        type: String,
        default: null
    },
    // OAuth/Clerk authentication
    authProvider: {
        type: String,
        enum: ['local', 'google', 'clerk'],
        default: 'local'
    },
    authProviderId: {
        type: String,
        default: null
    },
    refreshToken: {
        type: String,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
        type: Date,
        default: null
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate access token
userSchema.methods.getAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '1d' }
    );
};

// Generate refresh token
userSchema.methods.getRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '10d' }
    );
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
