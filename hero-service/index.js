// file: heroService.js
const express = require('express');
const mongoose = require('mongoose');
import { verifyToken } from '../auth-service/index';
  // OU recopie le code verifyToken dans ce fichier.
  // (Ici, on simule qu'on a un export depuis AuthService.)
require('dotenv').config();
const amqp = require('amqplib');
const app = express();
app.use(express.json());

// --- Config & Connexion Mongo ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/heroesdb';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- Modèle Hero ---
const heroSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: Number, default: 1 },
  hp: { type: Number, default: 100 },
  gold: { type: Number, default: 0 },
  inventory: { type: [String], default: [] },
  // On peut ajouter d'autres stats (force, défense, etc.)
});
const Hero = mongoose.model('Hero', heroSchema);

// --- Récupérer les héros du user connecté ---
app.get('/heroes', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const heroes = await Hero.find({ userId });
    res.json(heroes);
  } catch (err) {
    console.error('Erreur /heroes (GET):', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des héros.' });
  }
});

// --- Créer un nouveau héros ---
app.post('/heroes', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Nom du héros requis.' });
    }
    const newHero = new Hero({ userId, name });
    await newHero.save();
    res.status(201).json(newHero);
  } catch (err) {
    console.error('Erreur /heroes (POST):', err);
    res.status(500).json({ error: 'Erreur lors de la création du héros.' });
  }
});

// Ex: pour voir le détail d’un héros
app.get('/heroes/:id', verifyToken, async (req, res) => {
  try {
    const hero = await Hero.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!hero) {
      return res.status(404).json({ error: 'Héros introuvable ou appartenant à un autre utilisateur.' });
    }
    res.json(hero);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

async function listenCombatEvents() {
  try {
    const RABBIT_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
    const conn = await amqp.connect(RABBIT_URI);
    const channel = await conn.createChannel();
    await channel.assertExchange('events', 'topic', { durable: false });

    const { queue } = await channel.assertQueue('', { exclusive: true });
    // Souscription à "combat.end"
    await channel.bindQueue(queue, 'events', 'combat.end');
    console.log('[HeroService] En attente des COMBAT_END...');

    channel.consume(queue, async (msg) => {
      if (msg.content) {
        const event = JSON.parse(msg.content.toString());
        console.log('[HeroService] COMBAT_END reçu:', event);

        // On cherche le héros
        const hero = await Hero.findOne({ _id: event.heroId });
        if (!hero) {
          console.log('[HeroService] Héros introuvable pour ce combat.');
          return;
        }

        // Mettre à jour les PV si le héros a survécu
        if (event.winner === 'hero') {
          // Le héros a gagné, on met ses HP restants
          hero.hp = event.heroHPRemaining;
          // Eventuellement on lui file de l’or
          hero.gold += 10; // ex. reward
          // On peut augmenter son level, etc.
          hero.save();
          console.log(`[HeroService] Le héros ${hero._id} a gagné le combat.`);
        } else {
          // Le héros a perdu
          hero.hp = 0;
          await hero.save();
          console.log(`[HeroService] Le héros ${hero._id} a perdu le combat.`);
        }
      }
    }, { noAck: true });
  } catch (err) {
    console.error('Erreur d’abonnement COMBAT_END:', err);
  }
}

listenCombatEvents();

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[HeroService] Démarré sur le port ${PORT}`);
});
