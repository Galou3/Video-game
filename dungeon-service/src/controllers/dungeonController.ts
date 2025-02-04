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
        const dungeons = await Dungeon.find({});
        if (dungeons.length === 0) {
            const randomDungeon = generateRandomDungeon('Random Dungeon', 5, 5);
            await randomDungeon.save();
            return res.json(randomDungeon);
        }
        res.json(dungeons);
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
            res.status(500).json({ error: 'Erreur lors de l’entrée dans le donjon.' });
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
            if (!run.isRunning && run.lastPos && run.lastPos.x && run.lastPos.y && run.lastPos.x > 0 && run.lastPos.y > 0 ) {
                return res.status(400).json({ error: 'Le donjon est déjà terminé.' });
            }

            const dungeon = await Dungeon.findById(run.dungeonId);
            if (!dungeon) {
                return res.status(404).json({ error: 'Donjon introuvable.' });
            }

            if(!run || !dungeon) {
                return res.status(404).json({error: 'Error'});
            }

            if (!run.lastPos)
            {
                run.lastPos = {x: 0, y: 0};
            }

            const potentialX = run.lastPos.x + moveX;
            const potentialY = run.lastPos.y + moveY;

            if(potentialX < 0 || potentialX > dungeon.layout.length || potentialY < 0 || potentialY > (dungeon.layout[0] as any).length){
                return res.status(404).json({ error: 'Déplacement impossible.' });
            }

            run.lastPos.x = potentialX;
            run.lastPos.y = potentialY;
            await run.save();

            const cellContent = (dungeon.layout.at(run.lastPos.x as number) as any).at(run.lastPos.y as number);
            const monsters = ["ENNEMY", "BOSS"];

            if (!monsters.includes(cellContent)) {
                return res.json({ message: 'Aucun monstre sur cette case.', run });
            }

            const event = {
                type: 'combat.start',
                userId: run.userId,
                heroId: run.heroId,
                monster: cellContent,
                dungeonRunId: run._id
            };
            channel.publish('events', 'combat.start', Buffer.from(JSON.stringify(event)));
            return res.json({ message: 'Un monstre apparaît ! Combat enclenché.', run });
        } catch (err) {
            console.error('/dungeons/move error:', err);
            res.status(500).json({ error: 'Erreur lors du déplacement dans le donjon.' });
        }
    });

export { router as dungeonRouter };
