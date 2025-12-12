const Resume = require('../models/Resume');
const emailService = require('../services/emailService');
const pdfService = require('../services/pdfService');
const docxService = require('../services/docxService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Create new resume
 * @route   POST /api/resumes
 * @access  Private
 */
const createResume = async (req, res, next) => {
    try {
        // Add user to request body
        req.body.user = req.user.id;

        const resume = await Resume.create(req.body);

        // Send notification to admin
        emailService.notifyResumeCreated(req.user, resume);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Upload existing resume file
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a resume file'
            });
        }

        const { title, template } = req.body;

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.path, 'resumes');

        // Delete local file after upload
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        if (!uploadResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to upload file'
            });
        }

        // Create resume with uploaded file reference
        const resume = await Resume.create({
            user: req.user.id,
            title: title || `Uploaded Resume - ${new Date().toLocaleDateString()}`,
            template: template || 'modern',
            originalFile: {
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                filename: req.file.originalname
            }
        });

        // Send notification
        emailService.notifyResumeCreated(req.user, resume);

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: resume
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
 * @desc    Get all resumes for logged in user
 * @route   GET /api/resumes
 * @access  Private
 */
const getResumes = async (req, res, next) => {
    try {
        const resumes = await Resume.find({ user: req.user.id })
            .sort({ updatedAt: -1 })
            .select('title template isPublic createdAt updatedAt personalInfo.fullName originalFile');

        res.status(200).json({
            success: true,
            count: resumes.length,
            data: resumes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single resume
 * @route   GET /api/resumes/:id
 * @access  Private
 */
const getResume = async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resume'
            });
        }

        res.status(200).json({
            success: true,
            data: resume
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update resume
 * @route   PUT /api/resumes/:id
 * @access  Private
 */
const updateResume = async (req, res, next) => {
    try {
        let resume = await Resume.findById(req.params.id);

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
                message: 'Not authorized to update this resume'
            });
        }

        // Get updated sections for notification
        const updatedSections = Object.keys(req.body).filter(key =>
            ['personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications', 'languages'].includes(key)
        );

        resume = await Resume.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // Send notification to admin
        emailService.notifyResumeUpdated(req.user, resume, updatedSections);

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully',
            data: resume
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

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
                message: 'Not authorized to delete this resume'
            });
        }

        // Delete original file from Cloudinary if exists
        if (resume.originalFile?.publicId) {
            await deleteFromCloudinary(resume.originalFile.publicId);
        }

        const resumeTitle = resume.title;
        await Resume.findByIdAndDelete(req.params.id);

        // Send notification to admin
        emailService.notifyResumeDeleted(req.user, resumeTitle);

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download resume as PDF
 * @route   GET /api/resumes/:id/pdf
 * @access  Private
 */
const downloadResumePDF = async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resume'
            });
        }

        // Generate PDF
        const pdfBuffer = await pdfService.generateResumePDF(resume);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.pdf"`
        );

        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Download resume as DOCX
 * @route   GET /api/resumes/:id/docx
 * @access  Private
 */
const downloadResumeDocx = async (req, res, next) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this resume'
            });
        }

        // Generate DOCX
        const docxBuffer = await docxService.generateResumeDocx(resume);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}_resume.docx"`
        );

        res.send(docxBuffer);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update resume template
 * @route   PUT /api/resumes/:id/template
 * @access  Private
 */
const updateTemplate = async (req, res, next) => {
    try {
        const { template } = req.body;

        if (!template) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a template'
            });
        }

        let resume = await Resume.findById(req.params.id);

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
                message: 'Not authorized to update this resume'
            });
        }

        resume = await Resume.findByIdAndUpdate(
            req.params.id,
            { template },
            { new: true, runValidators: true }
        );

        // Send notification to admin
        emailService.notifyResumeUpdated(req.user, resume, ['template']);

        res.status(200).json({
            success: true,
            message: 'Template updated successfully',
            data: { template: resume.template }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Generate share link for resume
 * @route   POST /api/resumes/:id/share
 * @access  Private
 */
const generateShareLink = async (req, res, next) => {
    try {
        let resume = await Resume.findById(req.params.id);

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
                message: 'Not authorized to share this resume'
            });
        }

        // Generate share token
        const shareToken = resume.generateShareToken();
        await resume.save();

        const shareUrl = `${process.env.CORS_ORIGIN}/resume/shared/${shareToken}`;

        res.status(200).json({
            success: true,
            message: 'Share link generated successfully',
            data: {
                shareToken,
                shareUrl,
                expiresAt: resume.shareExpiry
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get shared resume by token
 * @route   GET /api/resumes/shared/:token
 * @access  Public
 */
const getSharedResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({
            shareToken: req.params.token,
            shareExpiry: { $gt: Date.now() }
        }).populate('user', 'name email');

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or share link expired'
            });
        }

        res.status(200).json({
            success: true,
            data: resume
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createResume,
    uploadResume,
    getResumes,
    getResume,
    updateResume,
    deleteResume,
    downloadResumePDF,
    downloadResumeDocx,
    updateTemplate,
    generateShareLink,
    getSharedResume
};
