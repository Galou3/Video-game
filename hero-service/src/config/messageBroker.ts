import amqp from 'amqplib';
import { Hero } from '../models/hero';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const COMBAT_QUEUE = 'combat-service';
const DUNGEON_QUEUE = 'dungeon-service';

const processMessage = async (queue: string, message: any) : Promise<any> => {
    try {
        const parsedMessage = JSON.parse(message.content.toString());
        const { heroId, updateType, value } = parsedMessage;

        const hero = await Hero.findById(heroId);
        if (!hero) {
            console.error(`Hero with ID ${heroId} not found.`);
            return;
        }

        if (updateType === 'gold') {
            hero.gold = (hero.gold || 0) + value;
        } else if (updateType === 'hp') {
            hero.hp = (hero.hp || 0) + value;
        } else {
            console.error(`Unknown update type: ${updateType}`);
            return;
        }

        await hero.save();
        console.log(`Hero ${heroId} updated successfully in response to ${queue} message.`);
    } catch (err: any) {
        console.error('Error processing message:', err.message);
    }
};

export const connectToRabbitMQ = async () : Promise<any> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(COMBAT_QUEUE, { durable: true });
        await channel.assertQueue(DUNGEON_QUEUE, { durable: true });

        channel.consume(COMBAT_QUEUE, (msg) => {
            if (msg) {
                processMessage(COMBAT_QUEUE, msg);
                channel.ack(msg);
            }
        });

        channel.consume(DUNGEON_QUEUE, (msg) => {
            if (msg) {
                processMessage(DUNGEON_QUEUE, msg);
                channel.ack(msg);
            }
        });

        console.log('RabbitMQ listeners initialized.');
    } catch (err: any) {
        console.error('Failed to connect to RabbitMQ:', err.message);
    }
};
