const amqp = require('amqplib');
const mongoose = require('mongoose');

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/heroesdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const heroSchema = new mongoose.Schema({
  userId: String,
  name: String,
  level: Number,
  inventory: [String],
});
const Hero = mongoose.model('Hero', heroSchema);

async function main() {
  const conn = await amqp.connect('amqp://admin:admin@localhost:5672');
  const channel = await conn.createChannel();

  await channel.assertExchange('events', 'topic', { durable: false });
  const { queue } = await channel.assertQueue('', { exclusive: true });
  // Ici, on veut écouter par exemple les événements de type "combat.end"
  await channel.bindQueue(queue, 'events', 'combat.end');

  console.log('[HeroService] En attente d’événements COMBAT_END...');

  channel.consume(queue, async msg => {
    const event = JSON.parse(msg.content.toString());
    console.log('[HeroService] Reçu un événement : ', event);

    if (event.type === 'COMBAT_END') {
      // Mettre à jour l’XP, l’inventaire du héros, etc.
      const hero = await Hero.findOne({ userId: event.userId });
      if (hero) {
        hero.level = hero.level + 1; // ex. simpliste
        await hero.save();
        console.log(`[HeroService] Héros mis à jour après combat pour userId=${event.userId}`);
      }
    }
  }, { noAck: true });
}

main().catch(console.error);
