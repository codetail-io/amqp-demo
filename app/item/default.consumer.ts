import { DefaultConsumer } from 'nativescript-amqp';
declare const java: any;

export class ConsumerDefault extends DefaultConsumer {
  constructor(channel) {
    super(channel);
    return global.__native(this);
  }
  handleDelivery(consumerTag, envelope, properties, body) {       // no work to do
    if (body != null) {
      let message = new java.lang.String(body, "UTF-8");
      console.log(" [x] Received message ... " + message);
    }
  }
}
