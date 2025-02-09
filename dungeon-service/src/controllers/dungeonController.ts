import express, { Request, Response } from "express";
import { Dungeon } from "../models/dungeon";
import { DungeonRun } from "../models/dungeonRun";
import { enterDungeonValidation, moveDungeonValidation } from "../validations/dungeonValidation";
import { validateRequest } from "../middlewares/middleware";
import { channel } from "../config/messageBroker";
import { generateRandomDungeon } from "../utils/utils";

const router = express.Router();

router.get('/get-dungeons', async (req: Request, res: Response) => {
    try {
        // Supprimer tous les donjons existants
        await Dungeon.deleteMany({});
        
        // Générer un nouveau donjon
        const randomDungeon = generateRandomDungeon('Random Dungeon', 5, 5);
        await randomDungeon.save();
        
        res.json([randomDungeon]);
    } catch (err) {
        console.error('/get-dungeons GET error:', err);
        res.status(500).json({ error: 'Erreur récupération donjons.' });
    }
});

router.post('/enter',
    [
        ...enterDungeonValidation
    ], validateRequest,
    async (req: Request, res: Response) => {
        try {
            const userId = req.headers['x-user-id'];
            const { heroId, dungeonId } = req.body;
            const dungeon = await Dungeon.findById(dungeonId);
            if (!dungeon) {
                return res.status(404).json({ error: 'Donjon introuvable.' });
            }

            const start = new DungeonRun({
                userId,
                heroId,
                dungeonId,
                lastPos: {x: 0, y: 0},
                isRunning: true
            });
            await start.save();

            res.status(201).json(start);
        } catch (err) {
            console.error('/dungeons/enter error:', err);
            res.status(500).json({ error: 'Erreur entree dans le donjon.' });
        }
    });

router.post('/move',
    [
        ...moveDungeonValidation
    ], validateRequest,
    async (req: Request, res: Response) => {
        try {
            const userId = req.headers['x-user-id'];
            const { runId, moveX, moveY } = req.body;
            const run = await DungeonRun.findOne({ _id: runId, userId: userId });
            if (!run) {
                return res.status(404).json({ error: 'DungeonRun introuvable ou non autorisé.' });
            }
            if (!run.isRunning) {
                return res.status(400).json({ error: 'Le donjon est déjà terminé.' });
            }

            const dungeon = await Dungeon.findById(run.dungeonId);
            if (!dungeon) {
                return res.status(404).json({ error: 'Donjon introuvable.' });
            }

            const potentialX = run.lastPos.x + moveX;
            const potentialY = run.lastPos.y + moveY;

            if(potentialX < 0 || potentialX >= dungeon.layout.length || 
               potentialY < 0 || potentialY >= dungeon.layout[0].length){
                return res.status(400).json({ error: 'Déplacement impossible.' });
            }

            run.lastPos.x = potentialX;
            run.lastPos.y = potentialY;
            await run.save();

            const cellContent = dungeon.layout[run.lastPos.x][run.lastPos.y];
            const monsters = ["ENNEMY", "BOSS"];

            if (cellContent === "DOOR") {
                run.isRunning = false;
                await run.save();
                return res.json({ 
                    message: 'Vous avez trouvé la sortie !',
                    finished: true,
                    rewards: { gold: 20, level: 1 },
                    run,
                    shouldRedirect: true
                });
            }

            if (monsters.includes(cellContent)) {
                return res.json({ 
                    message: 'Un monstre apparaît ! Combat enclenché.',
                    inCombat: true,
                    run 
                });
            }

            return res.json({ 
                message: 'Déplacement réussi.', 
                inCombat: false,
                run 
            });
        } catch (err) {
            console.error('/dungeons/move error:', err);
            res.status(500).json({ error: 'Erreur lors du déplacement dans le donjon.' });
        }
    });

export { router as dungeonRouter };
