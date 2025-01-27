// authService.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // ou un client SQL, selon ton choix
// Par simplicité on suppose MongoDB et une collection "users"

const app = express();
app.use(bodyParser.json());

// Connexion à MongoDB (adapter la string de connexion)
mongoose.connect('mongodb://localhost:27017/authdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Clé secrète pour JWT - à placer dans une vraie config
const SECRET_KEY = 'monSecretJWT';

// Endpoint d’inscription
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  // Idéalement hacher le mot de passe avant de le stocker
  const newUser = new User({ username, password });
  await newUser.save();
  res.json({ message: 'Utilisateur créé' });
});

// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }
  // Génération d’un token
  const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware de validation du token
function verifyToken(req, res, next) {
  const token = req.headers['x-auth-token'];
  if (!token) {
    return res.status(403).json({ error: 'Token manquant' });
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide' });
  }
}

// Exemple d’endpoint protégé
app.get('/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ user });
});

app.listen(3001, () => {
  console.log('AuthService démarré sur le port 3001');
});
