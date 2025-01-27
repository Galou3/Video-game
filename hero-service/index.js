// file: heroService.js
const express = require('express');
const mongoose = require('mongoose');
const { verifyToken } = require('../authservice/authMiddlewareExample'); 
  // OU recopie le code verifyToken dans ce fichier. 
  // (Ici, on simule qu'on a un export depuis AuthService.)
require('dotenv').config();

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

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[HeroService] Démarré sur le port ${PORT}`);
});
