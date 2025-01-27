// Exemple complet pour gérer l'inscription
// -------------------------------------------------------
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Exemple de connexion à ta base Mongo
mongoose.connect('mongodb://localhost:27017/authdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schéma et modèle d'utilisateur
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const SECRET_KEY = 'tonSecretJWT'; // À mettre dans une variable d'env en prod

// Endpoint pour s'inscrire
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
    }

    // Hachage du mot de passe (exemple : 10 rounds de salage)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrement en base
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
});

// Endpoint pour se connecter
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // Comparer le mot de passe hashé
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    // Génération d’un token JWT
    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

// Exposer l'API sur le port 3001
app.listen(3001, () => {
  console.log('AuthService démarré sur le port 3001');
});
