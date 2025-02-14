const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
const PORT = 3000;
const KAFKA_BROKER_URL = process.env.KAFKA_BROKER_URL;
const TOPIC_NAME = 'async_tasks';

const kafka = new Kafka({
    clientId: 'async-worker',
    brokers: [KAFKA_BROKER_URL]
});

const producer = kafka.producer();

app.get('/async-endpoint', async (req, res) => {
    await producer.connect();
    await producer.send({
        topic: TOPIC_NAME,
        messages: [{ value: 'Hello Kafka' }]
    });
    await producer.disconnect();

    res.json({ message: "Message sent to Kafka" });
});

const consumer = kafka.consumer({ groupId: 'test-group' });

async function processMessages() {
    console.log("===== Connect =====")
    await consumer.connect();
    console.log("===== subscribe =====")
    await consumer.subscribe({ topic: TOPIC_NAME });
    console.log("===== run =====")
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log(`Received message: ${message.value}`);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    processMessages(); // Start processing messages
});
