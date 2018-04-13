import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import * as app from 'application';
let activity = app.android.foregroundActivity;
declare const android: any;
declare var java: any;
@Injectable()
export class MessageService {
  private subject = new Subject<any>();

  sendMessage(message: string, channel: any, messagePropertyAux: any) {
    console.log("Sending message ... " + message);
    const text = new java.lang.String(message);
    const data = text.getBytes();
    channel.basicPublish("hello-exchange", "", null, text.getBytes());
    this.subject.next({ text: message });
  }
  receiverMessage(queueName: string) {
    this.subject.next({ text: queueName });
  }

  clearMessage() {
    this.subject.next();
  }
  consumerHack(message, client: any, channel): Promise<any> {
    return new Promise((resolve, reject) => {
      let queueName = channel.queueDeclare().getQueue();
      console.log(queueName);
      resolve();
    });
  }

  handleDelivery(consumerTag?, envelope?, properties?, body?) {
    let message1 = new java.lang.String(body, "UTF-8");
    try {
      console.log(9999);

    } catch (error) {

    }
  }
  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
