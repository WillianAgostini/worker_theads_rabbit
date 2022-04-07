import { connect } from 'amqplib';
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost:5672';

(async () => {
  const connection = await connect(amqpUrl, 'heartbeat=60');
  const channel = await connection.createChannel();
  try {
    console.log('Publishing');
    const exchange = 'user.signed_up';
    const queue = 'user.sign_up_email';
    const routingKey = 'sign_up_email';
    
    await channel.assertExchange(exchange, 'direct', {durable: true});
    await channel.assertQueue(queue, {durable: true});
    await channel.bindQueue(queue, exchange, routingKey);
    
    for (let index = 0; index < 500; index++) {
        let msg = {'id': Math.floor(Math.random() * 1000)};
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(msg)));
    }
    console.log('Message published');
  } catch(e) {
    console.error('Error in publishing message', e);
  } finally {
    console.info('Closing channel and connection if available');
    await channel.close();
    await connection.close();
    console.info('Channel and connection closed');
  }
  process.exit(0);
})();