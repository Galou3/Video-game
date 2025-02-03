import { body, header } from 'express-validator';

export const getUserValidation = [
    header('x-user-id')
        .exists().withMessage('User ID is required')
        .isMongoId().withMessage('User ID must be a valid MongoDB ID')
];

export const enterDungeonValidation = [
    ...getUserValidation,

    body('dungeonId')
        .exists().withMessage('Dungeon ID is required')
        .isMongoId().withMessage('Dungeon ID must be a valid MongoDB ID'),

    body('heroId')
        .exists().withMessage('Hero ID is required')
        .isMongoId().withMessage('Hero ID must be a valid MongoDB ID'),
];

export const moveDungeonValidation = [
    ...getUserValidation,

    body('runId')
        .exists().withMessage('Run ID is required')
        .isMongoId().withMessage('Run ID must be a valid MongoDB ID'),

    body('moveX')
        .exists().withMessage('Move X is required')
        .isNumeric().withMessage('Move X must be a number'),

    body('moveY')
        .exists().withMessage('Move Y is required')
        .isNumeric().withMessage('Move Y must be a number'),
];
