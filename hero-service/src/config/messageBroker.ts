import amqp from 'amqplib';
import { Hero } from '../models/hero';

const RABBITMQ_USER = process.env.RABBITMQ_USER || 'root';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'root';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}`;
const COMBAT_QUEUE = 'combat-service';
const DUNGEON_QUEUE = 'dungeon-service';

const processCombatMessage = async (queue: string, message: any): Promise<any> => {
    try {
        const content = message.content.toString();
        const combatEvent = JSON.parse(content);

        console.log(`Received combat event: ${combatEvent.type}`);

        if (combatEvent.type === 'combat.end') {
            const hero = await Hero.findById(combatEvent.heroId);
            if (hero) {
                const heroHp = hero.hp - combatEvent.hp;
                if (heroHp <= 0) {
                    hero.hp = 0;
                    await hero.save();
                    console.log(`Hero ${hero.name} has died.`);
                    return;
                }
                hero.hp = heroHp;
                await hero.save();
                console.log(`Hero ${hero.name} has ${hero.hp} HP left.`);
            }
        }
    } catch (err: any) {
        console.error('Error processing message:', err.message);
    }
};

const processDungeonMessage = async (queue: string, message: any): Promise<any> => {
    try {
        const content = message.content.toString();
        const dungeonEvent = JSON.parse(content);

        console.log(`Received dungeon event: ${dungeonEvent.type}`);

        if (dungeonEvent.type === 'dungeon.loot') {
            const hero = await Hero.findById(dungeonEvent.heroId);
            if (hero) {
                hero.gold += dungeonEvent.gold;
                await hero.save();
                console.log(`Hero ${hero.name} found ${dungeonEvent.gold} gold.`);
            }
        }
    } catch (err: any) {
        console.error('Error processing message:', err.message);
    }
};

export const connectToRabbitMQ = async (): Promise<any> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);

        // Create a channel for combat events
        const combatChannel = await connection.createChannel();

        // Declare the combat-service queue
        await combatChannel.assertQueue(COMBAT_QUEUE, { durable: false });

        // Declare the exchange
        await combatChannel.assertExchange('events', 'topic', { durable: false });

        // Bind the combat-service queue to the exchange with the routing key 'combat.*'
        await combatChannel.bindQueue(COMBAT_QUEUE, 'events', 'combat.*');

        // Start consuming messages from the combat-service queue
        combatChannel.consume(COMBAT_QUEUE, (msg) => {
            if (msg) {
                processCombatMessage(COMBAT_QUEUE, msg);
                combatChannel.ack(msg);
            }
        });

        // Create a channel for dungeon events
        const dungeonChannel = await connection.createChannel();

        // Declare the dungeon-service queue
        await dungeonChannel.assertQueue(DUNGEON_QUEUE, { durable: false });

        // Bind the dungeon-service queue to the exchange with the routing key 'dungeon.loot'
        await dungeonChannel.bindQueue(DUNGEON_QUEUE, 'events', 'dungeon.loot');

        // Start consuming messages from the dungeon-service queue
        dungeonChannel.consume(DUNGEON_QUEUE, (msg) => {
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
