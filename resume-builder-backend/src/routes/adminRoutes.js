const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');

// Admin middleware - checks if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
router.get('/users', protect, isAdmin, async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
router.get('/stats', protect, isAdmin, async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalResumes = await Resume.countDocuments();

        // Users created in last 7 days
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: lastWeek } });

        // Users created today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

        // Recent users
        const recentUsers = await User.find()
            .select('name email createdAt lastLogin')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalResumes,
                newUsersThisWeek,
                newUsersToday,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Get single user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
router.get('/users/:id', protect, isAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's resumes
        const resumes = await Resume.find({ user: req.params.id })
            .select('title template createdAt updatedAt');

        res.status(200).json({
            success: true,
            data: { user, resumes }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Update user (admin can change role, etc.)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
router.put('/users/:id', protect, isAdmin, async (req, res, next) => {
    try {
        const { isAdmin: makeAdmin, name, email } = req.body;

        const updateData = {};
        if (typeof makeAdmin === 'boolean') updateData.isAdmin = makeAdmin;
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
router.delete('/users/:id', protect, isAdmin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account from admin panel'
            });
        }

        // Delete user's resumes
        await Resume.deleteMany({ user: req.params.id });

        // Delete user
        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User and their resumes deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Make current user an admin (first-time setup)
 * @route   POST /api/admin/make-admin
 * @access  Private
 */
router.post('/make-admin', protect, async (req, res, next) => {
    try {
        const { secretKey } = req.body;

        // Use a secret key for first admin setup
        if (secretKey !== 'CAREERFORGE_ADMIN_2024') {
            return res.status(403).json({
                success: false,
                message: 'Invalid secret key'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isAdmin: true },
            { new: true }
        ).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            message: 'You are now an admin',
            data: user
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
