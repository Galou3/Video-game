// file: combatService.js
const amqp = require('amqplib');
const mongoose = require('mongoose');

require('dotenv').config();

// (Facultatif) si on veut loger les combats en base
mongoose.connect(process.env.MONGO_URI_COMBAT || 'mongodb://localhost:27017/combatdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Schéma minimaliste si on veut archiver le combat
const combatLogSchema = new mongoose.Schema({
  heroId: String,
  monster: String,
  heroHP: Number,
  monsterHP: Number,
  winner: String,
  timestamp: Date
});
const CombatLog = mongoose.model('CombatLog', combatLogSchema);

// Connexion RabbitMQ
async function main() {
  const RABBIT_URI = process.env.RABBITMQ_URI || 'amqp://localhost:5672';
  const conn = await amqp.connect(RABBIT_URI);
  const channel = await conn.createChannel();
  await channel.assertExchange('events', 'topic', { durable: false });

  // On crée une queue éphémère, on la bind sur 'combat.start'
  const { queue } = await channel.assertQueue('', { exclusive: true });
  await channel.bindQueue(queue, 'events', 'combat.start');

  console.log('[CombatService] Attente des événements COMBAT_START...');

  channel.consume(queue, async (msg) => {
    if (msg.content) {
      const event = JSON.parse(msg.content.toString());
      console.log('[CombatService] COMBAT_START reçu:', event);

      // --- Simulation d’un combat simplifié ---
      const heroHP = 100;      // On pourrait récupérer le heroHP exact dans HeroService
      const monsterHP = 50;    // Idem, on peut varier selon le monstre
      let round = 0;
      let hHP = heroHP;
      let mHP = monsterHP;

      // Simule un tour par tour
      while (hHP > 0 && mHP > 0) {
        round++;
        // Hero attaque
        mHP -= 10; // Ex. degats fixes
        if (mHP <= 0) break;
        // Monstre attaque
        hHP -= 5;  // Ex. degats fixes
      }

      const winner = hHP > 0 ? 'hero' : 'monster';
      const resultEvent = {
        type: 'COMBAT_END',
        userId: event.userId,
        heroId: event.heroId,
        monster: event.monster,
        winner,
        heroHPRemaining: hHP < 0 ? 0 : hHP,
        monsterHPRemaining: mHP < 0 ? 0 : mHP,
        dungeonRunId: event.dungeonRunId
      };

      // Optionnel: on enregistre dans la base
      const logEntry = new CombatLog({
        heroId: event.heroId,
        monster: event.monster,
        heroHP: heroHP,
        monsterHP: monsterHP,
        winner: winner,
        timestamp: new Date()
      });
      await logEntry.save();

      // On publie l’événement COMBAT_END
      channel.publish('events', 'combat.end', Buffer.from(JSON.stringify(resultEvent)));
      console.log('[CombatService] COMBAT_END publié:', resultEvent);
    }
  }, { noAck: true });
}

main().catch(console.error);
