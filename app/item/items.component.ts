import { Component, OnInit } from "@angular/core";
import { RabbitmqClient } from 'nativescript-amqp';
import { Item } from "./item";
import { ItemService } from "./item.service";
import { Subscription } from "rxjs";
import { MessageService } from "./message.service";
import { ConsumerDefault } from "./default.consumer";
declare const android: any;
declare const java: any;

@Component({
    selector: "ns-items",
    moduleId: module.id,
    templateUrl: "./items.component.html",
})
export class ItemsComponent implements OnInit {
    items: Item[];
    message: string = "";
    client: any;
    connect: any;
    subscription: Subscription;
    channel: any;
    messagePropertyAux: any;
    queueName: any;
    consumer: any;
    // This pattern makes use of Angular’s dependency injection implementation to inject an instance of the ItemService service into this class.
    // Angular knows about this service because it is included in your app’s main NgModule, defined in app.module.ts.
    constructor(private itemService: ItemService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.items = this.itemService.getItems();
        this.subscription = this.messageService.getMessage().subscribe(message => { this.message = message; });
        let policy = new android.os.StrictMode.ThreadPolicy.Builder().permitAll().build();
        android.os.StrictMode.setThreadPolicy(policy);
        this.client = new RabbitmqClient();
        // // console.dir(this.client);
        let factory = new this.client.ConnectionFactory();
        this.messagePropertyAux = this.client.MessageProperties;
        factory.setUsername("test");
        factory.setPassword("test");
        factory.setVirtualHost("/");
        factory.setHost("192.168.0.100");
        factory.setPort(5672);
        let connection = factory.newConnection();
        this.channel = connection.createChannel();
        this.channel.queueDeclare("hello", true, false, false, null);
        this.channel.exchangeDeclare("hello", 'direct');
        this.queueName = this.channel.queueDeclare().getQueue();
        this.channel.queueBind(this.queueName, "hello-exchange", "");
        this.recevieMessage();
        this.messageService.receiverMessage("holllaaa");
        // channel.close();
        // connection.close();
        // conn.close();
    }
    sendMessage() {
        let message = String(Math.floor(Math.random() * 100000) + 1);
        this.messageService.sendMessage(message, this.channel, this.messagePropertyAux);
        // this.channel.basicPublish('hello-exchange', "", null, "hello");
    }
    recevieMessage() {
        let body: any;
        const envelope = new this.client.Envelope(1000, false, "hello-exchange", "routingKey");
        const amqpBP = new this.client.AMQP.BasicProperties();
        this.consumer = new ConsumerDefault(this.channel);
        this.consumer.handleDelivery(this.queueName, envelope, amqpBP, body);
        this.channel.basicConsume(this.queueName, true, this.consumer);
        this.messageService.receiverMessage("holllaaa");
        this.consumer.handleDelivery(this.queueName, envelope, amqpBP, body);
        this.channel.basicConsume(this.queueName, true, this.consumer);
    }
    public handleDelivery(consumerTag, envelope, properties, body) {
        console.log("Receiver message ...:" + body);
        console.log(body);
    }
    // this.messageService.receiverMessage(this.queueName, this.client, this.channel);

    // this.defaultConsumer = this.client.defaultConsumer(this.channel);
    ngOnDestroy() {
        // unsubscribe to ensure no memory leaks
        this.subscription.unsubscribe();
    }
}
