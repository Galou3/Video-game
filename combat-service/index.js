const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');

const SECRET_KEY = 'monSecretJWT'; // Même clé que l’AuthService

const app = express();
app.use(bodyParser.json());

// Middleware pour valider le token (simplifié)
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

// Fonction utilitaire pour se connecter à RabbitMQ
async function connectRabbitMQ() {
  const conn = await amqp.connect('amqp://admin:admin@localhost:5672');
  const channel = await conn.createChannel();
  await channel.assertExchange('events', 'topic', { durable: false });
  return channel;
}

let channel;
connectRabbitMQ().then(ch => {
  channel = ch;
  console.log('Connecté à RabbitMQ depuis CombatService');
}).catch(console.error);

// Exemple d’endpoint déclenchant un combat
app.post('/start-combat', verifyToken, (req, res) => {
  // Logique de combat... (simplifié)
  const { enemyId } = req.body;
  // Publier un événement dans Rabbit
  const event = {
    type: 'COMBAT_START',
    userId: req.user.userId,
    enemyId: enemyId,
    timestamp: Date.now()
  };
  channel.publish('events', 'combat.start', Buffer.from(JSON.stringify(event)));
  
  res.json({ message: 'Combat démarré', event });
});

app.listen(3002, () => {
  console.log('CombatService démarré sur le port 3002');
});
