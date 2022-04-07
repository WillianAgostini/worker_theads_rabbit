import createWorker from './workers/createWorker.js';
import amqplib from 'amqplib';
import { PromisePool } from '@supercharge/promise-pool'
import { BehaviorSubject } from 'rxjs';
import process from 'process';
import os from 'os';

const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';
let limitParallelProcesses = 5;
let processando = 0;

async function processMessage(msg) {
    processando++;
    await createWorker(msg.content.toString());
    processando--;
}

(async () => {
    const connection = await amqplib.connect(amqpUrl);
    const channel = await connection.createChannel();
    channel.prefetch(limitParallelProcesses, true);
    const queue = 'user.sign_up_email';
    process.once('SIGINT', async () => {
        console.log('got sigint, closing connection');
        await channel.close();
        await connection.close();
        process.exit(0);
    });


    await channel.assertQueue(queue, { durable: true });

    setInterval(async () => {
        const usage = os.loadavg();
        const cpuUsage = usage[0] * 100;
        // const cpuUsage = process.cpuUsage().user / 100000;
        if (limitParallelProcesses > 1) {
            if (cpuUsage < 500)
                limitParallelProcesses++;
            else
                limitParallelProcesses--;
        }

        if (limitParallelProcesses < 1)
            limitParallelProcesses = 1;

        let q = await channel.assertQueue(queue, { durable: true });
        channel.prefetch(limitParallelProcesses, true);
        console.log(`CPU: ${cpuUsage} || Parallel processes: ${limitParallelProcesses} || Processando: ${processando} || Count queue: ${q.messageCount}`);
    }, 5000);

    await channel.consume(queue, async (msg) => {
        // console.log(` [x] Received ${msg.content.toString()}`);
        console.log(`.`);
        await processMessage(msg);
        await channel.ack(msg);
    }, {
        noAck: false,
        consumerTag: 'email_consumer'
    });
    console.log(" [*] Waiting for messages. To exit press CTRL+C");
})();

