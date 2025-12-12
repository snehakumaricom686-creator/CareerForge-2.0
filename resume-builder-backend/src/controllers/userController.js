const User = require('../models/User');
const emailService = require('../services/emailService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
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
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updatedFields = [];

        // Build update object
        const updateData = {};
        if (name && name !== req.user.name) {
            updateData.name = name;
            updatedFields.push('name');
        }
        if (email && email !== req.user.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.user.id) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            updateData.email = email;
            updatedFields.push('email');
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        );

        // Send notification to admin
        emailService.notifyProfileUpdate(user, updatedFields);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Check if user is OAuth user
        if (req.user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                message: 'Password change not available for social login accounts'
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Send notification to admin
        emailService.notifyProfileUpdate(user, ['password']);

        // Generate new tokens
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: { accessToken, refreshToken }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/users/profile-picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Get current user
        const user = await User.findById(req.user.id);

        // Delete old profile picture from Cloudinary if exists
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
            // Extract public ID from URL and delete
            const publicId = user.profilePicture.split('/').slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        // Upload new picture to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.path, 'profile-pictures');

        // Delete local file after upload
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (!uploadResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload profile picture'
            });
        }

        // Update user with new profile picture
        user.profilePicture = uploadResult.url;
        await user.save();

        // Send notification to admin
        emailService.notifyProfileUpdate(user, ['profilePicture']);

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                profilePicture: uploadResult.url
            }
        });
    } catch (error) {
        // Clean up uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // Delete profile picture from Cloudinary if exists
        if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
            const publicId = user.profilePicture.split('/').slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        // Delete all user's resumes (cascade)
        const Resume = require('../models/Resume');
        const resumes = await Resume.find({ user: req.user.id });

        for (const resume of resumes) {
            if (resume.originalFile?.publicId) {
                await deleteFromCloudinary(resume.originalFile.publicId);
            }
        }

        await Resume.deleteMany({ user: req.user.id });
        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    uploadProfilePicture,
    deleteAccount
};
