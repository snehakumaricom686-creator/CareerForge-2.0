const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/resumeController');

// Configure multer for resume file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (extname && mimetypes.includes(file.mimetype)) {
        return cb(null, true);
    }
    cb(new Error('Only PDF and Word documents are allowed!'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// Public route for shared resumes
router.get('/shared/:token', getSharedResume);

// Protected routes
router.use(protect);

router.route('/')
    .get(getResumes)
    .post(createResume);

router.post('/upload', upload.single('resume'), uploadResume);

router.route('/:id')
    .get(getResume)
    .put(updateResume)
    .delete(deleteResume);

router.get('/:id/pdf', downloadResumePDF);
router.get('/:id/docx', downloadResumeDocx);
router.put('/:id/template', updateTemplate);
router.post('/:id/share', generateShareLink);

module.exports = router;
