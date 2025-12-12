const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * @desc    Get social share links for a resume
 * @route   GET /api/share/:resumeId/links
 * @access  Private
 */
router.get('/:resumeId/links', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Generate share token if not exists
        if (!resume.shareToken || resume.shareExpiry < Date.now()) {
            resume.generateShareToken();
            await resume.save();
        }

        const shareUrl = `${process.env.CORS_ORIGIN}/resume/shared/${resume.shareToken}`;
        const encodedUrl = encodeURIComponent(shareUrl);
        const title = encodeURIComponent(`Check out my resume: ${resume.personalInfo?.fullName || resume.title}`);
        const description = encodeURIComponent(resume.personalInfo?.summary?.substring(0, 100) || 'View my professional resume');

        // Generate platform-specific share links
        const shareLinks = {
            shareUrl,
            platforms: {
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}`,
                telegram: `https://t.me/share/url?url=${encodedUrl}&text=${title}`,
                email: `mailto:?subject=${title}&body=${description}%0A%0A${shareUrl}`,
                copy: shareUrl
            },
            expiresAt: resume.shareExpiry
        };

        res.status(200).json({
            success: true,
            data: shareLinks
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Get OG meta tags for shared resume (for social previews)
 * @route   GET /api/share/meta/:token
 * @access  Public
 */
router.get('/meta/:token', async (req, res, next) => {
    try {
        const resume = await Resume.findOne({
            shareToken: req.params.token,
            shareExpiry: { $gt: Date.now() }
        }).populate('user', 'name');

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or expired'
            });
        }

        const meta = {
            title: resume.personalInfo?.fullName || resume.title,
            description: resume.personalInfo?.summary?.substring(0, 160) || 'Professional Resume',
            name: resume.user?.name || 'Resume Builder User',
            url: `${process.env.CORS_ORIGIN}/resume/shared/${resume.shareToken}`,
            type: 'profile'
        };

        res.status(200).json({
            success: true,
            data: meta
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Track share click (analytics)
 * @route   POST /api/share/track/:token
 * @access  Public
 */
router.post('/track/:token', async (req, res, next) => {
    try {
        const { platform } = req.body;

        const resume = await Resume.findOne({
            shareToken: req.params.token
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // You can add analytics tracking here
        // For now, just acknowledge the track
        console.log(`Share tracked: Resume ${resume._id} shared on ${platform}`);

        res.status(200).json({
            success: true,
            message: 'Share tracked'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @desc    Disable sharing for a resume
 * @route   DELETE /api/share/:resumeId
 * @access  Private
 */
router.delete('/:resumeId', protect, async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.resumeId);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Remove share token
        resume.shareToken = null;
        resume.shareExpiry = null;
        await resume.save();

        res.status(200).json({
            success: true,
            message: 'Sharing disabled for this resume'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
