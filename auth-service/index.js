// file: authService.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Pour charger les variables d'environnement éventuelles

const app = express();
app.use(express.json());

// --- Configuration & Connexion MongoDB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- Modèle User ---
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- JWT secret ---
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'myJwtSecret';

// --- Inscription ---
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Vérifie si l'utilisateur existe déjà
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
    }
    // Hachage du mot de passe
    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hash });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (err) {
    console.error('Erreur /register:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
});

// --- Connexion ---
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    // Génération du token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    console.error('Erreur /login:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

// --- Middleware de vérification du token ---
function verifyToken(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(403).json({ error: 'Token manquant.' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide.' });
  }
}

// --- Exemple d'endpoint protégé (facultatif) ---
app.get('/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  res.json({ user });
});

// --- Lancement du service ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[AuthService] Démarré sur le port ${PORT}`);
});

// Export du middleware si besoin ailleurs
module.exports = {
  verifyToken,
};
