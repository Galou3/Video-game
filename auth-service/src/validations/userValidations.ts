import { body } from 'express-validator';

export const userRegistrationValidation = [
    body('username')
        .exists().withMessage('Username is required')
        .isLength({ min: 1, max: 255 }).withMessage('Username must not exceed 255 characters')
        .trim()
        .escape(),

    body('password')
        .exists().withMessage('Password is required')
        .isLength({ min: 8, max: 255 }).withMessage('Password must be at least 8 characters and not exceed 255 characters')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/).withMessage('Password must contain at least one special character'),

    body('confirm-password')
        .exists().withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
];
