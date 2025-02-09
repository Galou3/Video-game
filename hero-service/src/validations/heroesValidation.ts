import { body, header, param } from 'express-validator';

export const getUserValidation = [
    header('x-user-id')
        .exists().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ID')
];

export const getHeroValidation = [
    ...getUserValidation,

    body('heroId')
        .exists().withMessage('Hero ID is required')
        .isMongoId().withMessage('Hero ID must be a valid MongoDB ID')
];

export const createHeroValidation = [
    ...getUserValidation,

    body('name')
        .exists().withMessage('Name is required')
        .isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters')
        .trim()
        .escape(),
];

export const deleteHeroValidation = [
    ...getUserValidation,
    param('id')
        .notEmpty().withMessage('Hero ID is required')
        .isMongoId().withMessage('Hero ID must be a valid MongoDB ID')
];
