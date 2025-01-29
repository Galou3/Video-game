import {DungeonRunSchema} from "./types/DungeonRunSchema";
import express, {Request, Response} from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import amqp from 'amqplib';
import {DungeonSchema} from "./types/DungeonSchema";
require('dotenv').config();

const PORT = process.env.PORT || 3003;
const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dungeons';
const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://root:root@localhost:5672';

app.use(express.json());

mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
} as ConnectOptions).then(() => {
	console.log('MongoDB Connected');
});

const Dungeon = mongoose.model('Dungeon', DungeonSchema);

const DungeonRun = mongoose.model('DungeonRun', DungeonRunSchema);

let channel: any = null;
async function connectRabbit() {
	try {

		const conn = await amqp.connect(RABBITMQ_URI);
		channel = await conn.createChannel();
		await channel.assertExchange('events', 'topic', { durable: false });
		console.log('[DungeonService] Connecté à RabbitMQ');
	} catch (err) {
		console.error('Erreur connexion RabbitMQ:', err);
	}
}
connectRabbit().then(async () => {
	console.log('RabbitMQ Connected');
});

app.get('/dungeons', async (_, res: Response) => {
	try {
		const dungeons = await Dungeon.find({});
		res.json(dungeons);
	} catch (err) {
		console.error('/dungeons GET error:', err);
		res.status(500).json({ error: 'Erreur récupération donjons.' });
	}
});

app.post('/dungeons/enter', async (req: Request, res: Response) => {
	try {
		const { userId, heroId, dungeonId } = req.body;
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

app.post('/dungeons/move', async (req: Request, res: Response) => {
	try {
		const { userId, runId, moveX, moveY } = req.body;
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

		if(run.lastPos && dungeon.layout && run.lastPos.x){
			const potentialX = run.lastPos.x+moveX;
			const potentialY = run.lastPos.y+moveY;

			if(potentialX < 0 || potentialX > dungeon.layout.length || potentialY < 0 || potentialY > (dungeon.layout[0] as any).length){
				return res.status(404).json({ error: 'Déplacement impossible.' });
			}

			run.lastPos.x = potentialX;
			run.lastPos.y = potentialY;
			await run.save();

			const cellContent = (dungeon.layout.at(run.lastPos.x as number) as any).at(run.lastPos.y as number)   // [run.lastPos.x as number][run.lastPos.y as number] as String;
			const monsters = ["ENNEMY", "BOSS"];

			if (!monsters.includes(cellContent)) {
				return res.json({ message: 'Aucun monstre sur cette case.', run });
			}

			const event = {
				type: 'combat.start',
				userId: run.userId,
				heroId: run.heroId,
				monster: cellContent,
				dungeonRunId: run._id.toString()
			};
			channel.publish('events', 'combat.start', Buffer.from(JSON.stringify(event)));
			return res.json({ message: 'Un monstre apparaît ! Combat enclenché.', run });
		}

		return res.status(404).json({ error: 'Une erreur est survenue' });
	} catch (err) {
		console.error('/dungeons/move error:', err);
		res.status(500).json({ error: 'Erreur lors du déplacement dans le donjon.' });
	}
});

app.listen(PORT, () => {
	console.log(`[DungeonService] Démarré sur le port ${PORT}`);
});
