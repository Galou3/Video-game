const amqp = require('amqplib');
const mongoose = require('mongoose');

// Connexion MongoDB (exemple)
mongoose.connect('mongodb://localhost:27017/dungeondb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const dungeonSchema = new mongoose.Schema({
  name: String,
  lastEvent: String,
  updatedAt: Date,
  // etc.
});
const Dungeon = mongoose.model('Dungeon', dungeonSchema);

async function main() {
  const conn = await amqp.connect('amqp://admin:admin@localhost:5672');
  const channel = await conn.createChannel();

  await channel.assertExchange('events', 'topic', { durable: false });
  // Création d’une queue éphémère, qu’on lie ensuite à l’exchange
  const { queue } = await channel.assertQueue('', { exclusive: true });
  // Souscrire à tous les événements "dungeon.*"
  await channel.bindQueue(queue, 'events', 'dungeon.*');

  console.log('[DungeonService] En attente d’événements...');

  channel.consume(queue, async msg => {
    if (msg.content) {
      const event = JSON.parse(msg.content.toString());
      console.log('[DungeonService] Reçu un événement : ', event);

      // Exemple : mise à jour d’un donjon si on reçoit "dungeon.update"
      if (event.type === 'DUNGEON_UPDATE') {
        // logiquement, tu ferais un findOneAndUpdate
        await Dungeon.findOneAndUpdate(
          { name: event.dungeonName },
          {
            lastEvent: event.type,
            updatedAt: new Date()
          },
          { upsert: true }
        );
      }
    }
  }, { noAck: true });
}

main().catch(console.error);
