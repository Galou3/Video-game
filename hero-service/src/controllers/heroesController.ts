import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();
import { Hero } from '../models/hero';
import { validateRequest } from "../middlewares/middleware";
import {
    createHeroValidation,
    getUserValidation,
    getHeroValidation,
} from "../validations/heroesValidation";

// @route   GET /get-heroes
// @desc    Get all heroes
// @access  Private
router.get('/get-heroes',
    [
        ...getUserValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const userId = req.headers['x-user-id'];
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
        ...createHeroValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const { name, power } = req.body;
        const userId = req.headers['x-user-id'];
        const hero = new Hero({ userId, name, power });
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
        ...getUserValidation,
        ...getHeroValidation
    ], validateRequest,
    async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const userId = req.headers['x-user-id'];
        const hero = await Hero.findOne({ _id: req.params.id, userId });
        return res.status(200).json(hero);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

router.post('/update-hp', [
    ...getUserValidation,
    ...getHeroValidation
], validateRequest,
async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        const userId = req.headers['x-user-id'];
        const { heroId, hpChange } = req.body;

        // Validation de hpChange
        if (typeof hpChange !== 'number') {
            return res.status(400).json({ error: 'hpChange must be a number' });
        }

        const hero = await Hero.findOne({ _id: heroId, userId });
        
        if (!hero) {
            return res.status(404).json({ error: 'Hero not found' });
        }
        hero.hp += hpChange;

        if (hero.hp < 0) {
            hero.hp = 0;
        }

        await hero.save();

        return res.status(200).json({ 
            message: 'HP updated successfully',
            currentHp: hero.hp
        });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

export { router as heroesRouter };
