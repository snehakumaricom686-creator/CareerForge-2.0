const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validate
];

/**
 * Validation rules for login
 */
const loginValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

/**
 * Validation rules for resume creation
 */
const resumeValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Resume title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    resumeValidation,
    validate
};
