import amqp from 'amqplib';

const RABBITMQ_USER = process.env.RABBITMQ_USER || 'root';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'root';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@localhost:${RABBITMQ_PORT}`;

let channel: amqp.Channel;

export const connectToRabbitMQ = async (): Promise<void> => {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange('events', 'topic', { durable: false });
        console.log('RabbitMQ listeners initialized.');
    } catch (err: any) {
        console.error('Failed to connect to RabbitMQ:', err.message);
    }
};

export { channel };
