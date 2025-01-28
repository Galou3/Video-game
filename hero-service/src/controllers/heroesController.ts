import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { Hero } from '../models/hero';
import { validateRequest } from "../middlewares/middleware";
import { getHeroesValidation } from "../validations/heroesValidation";

// @route   GET /get-heroes
// @desc    Get all heroes
// @access  Private
router.get('/get-heroes',
    [
        ...getHeroesValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const userId = req.body.userId;
        const heroes = await Hero.find({userId});
        return res.status(200).json(heroes);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

// @route   Post /create-hero
// @desc    Get all user heroes
// @access  Private
router.post('/create-hero',
    [
        ...getHeroesValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const { name, power } = req.body;
        const hero = new Hero({ name, power });
        await hero.save();
        return res.status(201).json({ message: 'Héro créé avec succès.' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

// @route   Post /get-hero/:id
// @desc    Get user hero by id
// @access  Private
router.get('/get-hero/:id',
    [
        ...getHeroesValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const userId = req.body.userId;
        const hero = await Hero.findOne({ _id: req.params.id, userId });
        return res.status(200).json(hero);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

export { router as heroesRouter };
