import amqp from 'amqplib';

const RABBITMQ_USER = process.env.RABBITMQ_USER || 'root';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'root';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}`;
const DUNGEON_QUEUE = 'dungeon-service';

const processDungeonMessage = async (queue: string, message: any) : Promise<any> => {
    try {
        const content = message.content.toString();
        const dungeonEvent = JSON.parse(content);

        console.log(`Received dungeon event: ${dungeonEvent.type}`);

        let hpLost = 0;

        if (dungeonEvent.type === 'combat.start') {
            if (dungeonEvent.cell === "ENNEMY") {
                hpLost = Math.floor(Math.random() * 10) + 1;
                console.log(`Hero ${dungeonEvent.heroId} lost ${hpLost} HP.`);
            } else if (dungeonEvent.cell == "BOSS") {
                hpLost = Math.floor(Math.random() * 20) + 1;
                console.log(`Hero ${dungeonEvent.heroId} lost ${hpLost} HP.`);
            }

            const event = {
                type: 'combat.end',
                heroId: dungeonEvent.heroId,
                hp: hpLost
            }

            const connection = await amqp.connect(RABBITMQ_URL);

            const combatChannel = await connection.createChannel();

            combatChannel.assertExchange('events', 'topic', { durable: false });

            combatChannel.publish('events', 'combat.end', Buffer.from(JSON.stringify(event)));
        }
    } catch (err: any) {
        console.error('Error processing message:', err.message);
    }
}

export const connectToRabbitMQ = async () : Promise<any> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const dungeonChannel = await connection.createChannel();

        const dungeonQueue = await dungeonChannel.assertQueue('', { durable: false });

        dungeonChannel.assertExchange('events', 'topic', { durable: false });

        dungeonChannel.bindQueue(DUNGEON_QUEUE, 'events', 'dungeon.loot');

        dungeonChannel.consume(dungeonQueue.queue, (msg) => {
            if (msg) {
                processDungeonMessage(DUNGEON_QUEUE, msg);
                dungeonChannel.ack(msg);
            }
        });

        console.log('RabbitMQ listeners initialized.');
    } catch (err: any) {
        console.error('Failed to connect to RabbitMQ:', err.message);
    }
};
