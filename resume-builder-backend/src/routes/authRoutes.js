const express = require('express');
const router = express.Router();
const { protect, verifyRefreshToken } = require('../middleware/auth');
const {
    register,
    login,
    googleAuth,
    clerkAuth,
    refreshToken,
    logout,
    getMe,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/clerk', clerkAuth);
router.post('/refresh-token', verifyRefreshToken, refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
