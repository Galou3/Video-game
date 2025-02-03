import { body, header } from 'express-validator';

export const getHeroesValidation = [
    header('x-user-id')
        .exists().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ID')
];

export const getHeroValidation = [
    ...getHeroesValidation,

    body('heroId')
        .exists().withMessage('Hero ID is required')
        .isMongoId().withMessage('Hero ID must be a valid MongoDB ID')
];

export const createHeroValidation = [
    ...getHeroesValidation,

    body('name')
        .exists().withMessage('Name is required')
        .isLength({ min: 1, max: 255 }).withMessage('Name must not exceed 255 characters')
        .trim()
        .escape(),
];
