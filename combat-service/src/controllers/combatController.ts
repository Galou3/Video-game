import express, { Request, Response, NextFunction } from 'express';
const router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
    try {
        return res.status(200).json({ message: 'Service de combat.' });
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'Erreur interne.' });
    }
});

export { router as combatRouter };

