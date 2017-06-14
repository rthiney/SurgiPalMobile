
import { AuthService, AzureMobile, LoggerService } from './../../shared/index';
import { DoctorMessageModel } from '../../models/viewmodels/doctor_message_model';
import { Component } from '@angular/core';

import { NavController, NavParams, Events, ViewController } from 'ionic-angular';

import { DoctorMessage } from "../../models/DoctorMessage";
import azureMobileClient from 'azure-mobile-apps-client';
import { MessageService } from "../message/message.service";
 
import { MessageGroupItem } from "../../models/metrics";

@Component({
  selector: 'page-message-detail',
  templateUrl: 'message-detail.html'
})
export class MessageDetailPage {
  message: DoctorMessageModel;
  messageItem: MessageGroupItem
  client: any;
  table: any;
  messageAzure: any;
  constructor(private auth: AuthService, public navCtrl: NavController, public navParams: NavParams, private _service: MessageService, public log: LoggerService, public _events: Events,
    public viewCtrl: ViewController) {
    // this.log.console('Loaded MessageDetailPage', this.navParams.data);
    this.message = this.navParams.data;
  
  }
  ionViewWillEnter() {

    this.subscribeToEvents();
     
    this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    this.table = this.client.getTable('MessagesData');
    this.log.console('Loaded MessageDetailPage AzureMobile URL', AzureMobile.url);
    this.messageAzure = this.saveToMobileClientTable();
  }
  dismiss(msg: string) {
    this.viewCtrl.dismiss(msg);
  }
  subscribeToEvents() {
    this._events.subscribe('messagedata:inserted', (n) => {
      console.log('messagedata:inserted',n);
      this.messageAzure = n
      
    });
    this._events.subscribe('messagedata:updated', (n) => {
      console.log('messagedata:updated',n); 
      this.messageAzure = n ;
    });
  }
  saveToMobileClientTable() {

    console.log('Checking for existing message data.', this.table);
    this.table
      .where({ message_id: this.message.id })
      .read()
      .then(res => {

        if (!res[0]) {
          console.log('Message data did exist. ', res[0]);

          var newData = {
            message_id: this.message.id, viewcount: 1
          };
          console.log('Creating Message.', newData);
          this.table
            .insert(newData)
            .then((rers) => { this._events.publish('messagedata:inserted', rers); })
            .done(function (insertedItem) {

            }, this.failure); 
        }
        else {
          console.log('Found data. ');
           this.updateMessageDate(res[0]); 
        }

      }
      , this.failure);
  }

  updateMessageDate(res: any) {
    console.group('updateMessageDate()');
    console.log('updateMessageDate() Message Data ID', res.id);
    var updateData = { id: res.id, viewcount: res.viewcount + 1 };
    console.log('updateMessageDate() New Value', updateData);
    this.table.update(updateData).then(res => {
      console.log('updateMessageDate() Done', updateData);
      this._events.publish('messagedata:updated', res);
    }).done(function (updatedItem) {
      console.log('updateMessageDate() updatedItem', updatedItem);
    }, this.failure);

  }

  failure(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    this.log.error(errMsg); // log to console instead
    return errMsg;
  }
}
