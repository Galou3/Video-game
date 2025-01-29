import amqp from 'amqplib';
import { Hero } from '../models/hero';

const RABBITMQ_USER = process.env.RABBITMQ_USER || 'root';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'root';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}`;
const COMBAT_QUEUE = 'combat-service';
const DUNGEON_QUEUE = 'dungeon-service';

const processCombatMessage = async (queue: string, message: any) : Promise<any> => {
    try {
        const content = message.content.toString();
        const combatEvent = JSON.parse(content);

        console.log(`Received combat event: ${combatEvent.type}`);

        if (combatEvent.type === 'combat.end') {
            const hero = await Hero.findById ( combatEvent.heroId );
            if ( hero )
            {
                const heroHp = hero.hp - combatEvent.hp;
                if ( heroHp <= 0 )
                {
                    hero.hp = 0;
                    await hero.save ();
                    console.log ( `Hero ${ hero.name } has died.` );
                    return;
                }
                hero.hp = heroHp;
                await hero.save ();
                console.log ( `Hero ${ hero.name } has ${ hero.hp } HP left.` );
            }
        }
    } catch (err: any) {
        console.error('Error processing message:', err.message);
    }
};

const processDungeonMessage = async (queue: string, message: any) : Promise<any> => {
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
}

export const connectToRabbitMQ = async () : Promise<any> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const combatChannel = await connection.createChannel();

        const combatQueue = await combatChannel.assertQueue('', { durable: false });

        combatChannel.assertExchange('events', 'topic', { durable: false });

        combatChannel.bindQueue(COMBAT_QUEUE, 'events', 'combat.*');

        combatChannel.consume(combatQueue.queue, (msg) => {
            if (msg) {
                processCombatMessage(COMBAT_QUEUE, msg);
                combatChannel.ack(msg);
            }
        });

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
