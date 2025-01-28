import { body } from 'express-validator';

export const loginValidation = [
    body('email')
        .exists().withMessage('Username is required')
        .isLength({ min: 1, max: 255 }).withMessage('Username must not exceed 255 characters')
        .trim()
        .escape(),

    body('password')
        .exists().withMessage('Password is required')
        .isLength({ min: 8, max: 255 }).withMessage('Password must be at least 8 characters and not exceed 255 characters')
];
