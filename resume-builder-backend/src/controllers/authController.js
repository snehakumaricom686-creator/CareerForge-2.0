const User = require('../models/User');
const emailService = require('../services/emailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            authProvider: 'local'
        });

        // Send notification to admin
        emailService.notifyNewUserRegistration(user);

        // Generate tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        // Save refresh token to user
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user registered with OAuth
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: `Please login using ${user.authProvider}`
            });
        }

        // Check password match
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Send login notification to admin
        emailService.notifyUserLogin(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Google OAuth Login/Register
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleAuth = async (req, res, next) => {
    try {
        const { email, name, googleId, profilePicture } = req.body;

        if (!email || !googleId) {
            return res.status(400).json({
                success: false,
                message: 'Email and Google ID are required'
            });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with Google info if not already linked
            if (!user.authProviderId) {
                user.authProvider = 'google';
                user.authProviderId = googleId;
                if (profilePicture) user.profilePicture = profilePicture;
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                authProvider: 'google',
                authProviderId: googleId,
                profilePicture
            });

            // Send notification for new user
            emailService.notifyNewUserRegistration(user);
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Send login notification
        emailService.notifyUserLogin(user);

        res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clerk OAuth Login/Register
 * @route   POST /api/auth/clerk
 * @access  Public
 */
const clerkAuth = async (req, res, next) => {
    try {
        const { email, name, clerkId, profilePicture } = req.body;

        if (!email || !clerkId) {
            return res.status(400).json({
                success: false,
                message: 'Email and Clerk ID are required'
            });
        }

        // Check if user exists
        let user = await User.findOne({
            $or: [{ email }, { authProviderId: clerkId }]
        });

        if (user) {
            // Update existing user
            if (user.authProvider !== 'clerk') {
                user.authProvider = 'clerk';
                user.authProviderId = clerkId;
            }
            if (profilePicture) user.profilePicture = profilePicture;
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                authProvider: 'clerk',
                authProviderId: clerkId,
                profilePicture
            });

            // Send notification for new user
            emailService.notifyNewUserRegistration(user);
        }

        // Update last login
        user.lastLogin = new Date();

        // Generate tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Send login notification
        emailService.notifyUserLogin(user);

        res.status(200).json({
            success: true,
            message: 'Clerk authentication successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('+refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new access token
        const accessToken = user.getAccessToken();

        res.status(200).json({
            success: true,
            data: { accessToken }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token
        await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with that email'
            });
        }

        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: `Password reset not available for ${user.authProvider} accounts`
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Password reset token generated',
            data: {
                resetToken,
                note: 'In production, this token would be sent via email'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const crypto = require('crypto');

        // Hash the token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        // Find user by reset token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send notification about password change
        emailService.notifyProfileUpdate(user, ['password']);

        // Generate new tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: { accessToken, refreshToken }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    googleAuth,
    clerkAuth,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword
};
