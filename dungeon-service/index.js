// file: dungeonService.js
const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib');
require('dotenv').config();

const app = express();
app.use(express.json());

// --- Connexion Mongo ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dungeondb';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- Modèles ---
const dungeonSchema = new mongoose.Schema({
  name: String,
  layout: Array,
  // layout = [ { position: 0, monster: 'Goblin' }, { position: 1, monster: null }, ... ]
  // ou un format plus complexe
});
const Dungeon = mongoose.model('Dungeon', dungeonSchema);

const dungeonRunSchema = new mongoose.Schema({
  userId: String,
  heroId: String,
  dungeonId: String,
  currentPosition: Number,
  finished: Boolean
});
const DungeonRun = mongoose.model('DungeonRun', dungeonRunSchema);

// --- Connection RabbitMQ ---
let channel = null;
async function connectRabbit() {
  try {
    const RABBITMQ_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
    const conn = await amqp.connect(RABBITMQ_URI);
    channel = await conn.createChannel();
    await channel.assertExchange('events', 'topic', { durable: false });
    console.log('[DungeonService] Connecté à RabbitMQ');
  } catch (err) {
    console.error('Erreur connexion RabbitMQ:', err);
  }
}
connectRabbit();

const verifyToken = () => {

}

// --- Lister les donjons disponibles ---
app.get('/dungeons', verifyToken, async (req, res) => {
  try {
    const dungeons = await Dungeon.find({});
    res.json(dungeons);
  } catch (err) {
    console.error('/dungeons GET error:', err);
    res.status(500).json({ error: 'Erreur récupération donjons.' });
  }
});

// --- Entrer dans un donjon ---
app.post('/dungeons/enter', verifyToken, async (req, res) => {
  try {
    const { heroId, dungeonId } = req.body;
    // Vérifier existence du donjon
    const dungeon = await Dungeon.findById(dungeonId);
    if (!dungeon) {
      return res.status(404).json({ error: 'Donjon introuvable.' });
    }

    // Créer le DungeonRun
    const run = new DungeonRun({
      userId: req.user.userId,
      heroId,
      dungeonId,
      currentPosition: 0,
      finished: false
    });
    await run.save();

    // Retourne la run
    res.status(201).json(run);
  } catch (err) {
    console.error('/dungeons/enter error:', err);
    res.status(500).json({ error: 'Erreur lors de l’entrée dans le donjon.' });
  }
});

// --- Se déplacer dans le donjon ---
app.post('/dungeons/move', verifyToken, async (req, res) => {
  try {
    const { runId } = req.body;
    // Récupérer la run
    const run = await DungeonRun.findOne({ _id: runId, userId: req.user.userId });
    if (!run) {
      return res.status(404).json({ error: 'DungeonRun introuvable ou non autorisé.' });
    }
    if (run.finished) {
      return res.status(400).json({ error: 'Le donjon est déjà terminé.' });
    }

    // Récupérer le donjon
    const dungeon = await Dungeon.findById(run.dungeonId);
    if (!dungeon) {
      return res.status(404).json({ error: 'Donjon introuvable.' });
    }

    // Incrémente la position
    run.currentPosition++;
    // Vérifie si on est à la fin du donjon
    if (run.currentPosition >= dungeon.layout.length) {
      run.finished = true;
      await run.save();
      return res.json({ message: 'Donjon terminé !', run });
    }

    // Vérifie si la case contient un monstre
    const currentCase = dungeon.layout[run.currentPosition];
    await run.save();

    if (currentCase && currentCase.monster) {
      // Publie un événement "COMBAT_START"
      const event = {
        type: 'COMBAT_START',
        userId: run.userId,
        heroId: run.heroId,
        monster: currentCase.monster,
        dungeonRunId: run._id.toString()
      };
      channel.publish('events', 'combat.start', Buffer.from(JSON.stringify(event)));
      return res.json({ message: 'Un monstre apparaît ! Combat enclenché.', run });
    } else {
      return res.json({ message: 'Aucun monstre sur cette case.', run });
    }
  } catch (err) {
    console.error('/dungeons/move error:', err);
    res.status(500).json({ error: 'Erreur lors du déplacement dans le donjon.' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`[DungeonService] Démarré sur le port ${PORT}`);
});
