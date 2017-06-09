import { MessageService } from './message.service';
import { MessageMetrics } from './../../models/metrics';
import { DoctorMessageModel } from './../../models/viewmodels';
import { MessageReplyModal } from './message-reply';
 
import { Component, ViewChild } from '@angular/core';
import { ActionSheet, ActionSheetController, Config, NavController, LoadingController, App, ModalController, ToastController, Events, List } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import {MessageDetailPage} from '../message-detail/message-detail';
 
 
import { AuthService, NotifyService, LoggerService } from "../../shared/index";
import { DoctorMessage} from "../../models/DoctorMessage";
import { MessageData } from "./message-data";

declare var require: any;
@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessageListPage {
 
  groups: any;

  @ViewChild('messageList', { read: List }) messageList: List;
    queryText = '';
     shownMessages: any ;
     metrics:MessageMetrics;
  dates: any = [];
  confDate: string; 
   groupedMessages = [];  
  actionSheet: ActionSheet;
  messages: DoctorMessageModel= [];
    messagesRead: DoctorMessageModel= [];
    messagesUnread: DoctorMessageModel= [];
 segment = 'unread';
  constructor(
    public app: App,
    private auth : AuthService, 
    private _service : MessageData,
       private _msgService :MessageService,
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController, 
    public modalCtrl:ModalController,
    public config: Config,
    public note: NotifyService,
       public log: LoggerService,
          public events: Events 
  ) {
    this.app.setTitle('Messages'); 
   }

  ionViewDidLoad() {  
 // this.insight.trackPageView('Messages');
   //this.insight.trackPageView('Messages');
    this.app.setTitle('Messages');
      this.subscribeToEvents();
    console.log('FOSID',this.auth.fosId);
    if (this.auth.fosId !== undefined)
 
    this.updateSchedule(false);

     
  }


  subscribeToEvents() {
    this.events.subscribe('messagedata:markedRead', (n) => {
      console.log('messagedata:markedRead',n);
    //  alert('messagedata:markedRead' + n.toString());
 this.updateSchedule(true);
    //  this.messageData = n
    });
    this.events.subscribe('messagedata:updated', (n) => {
  //     alert('messagedata:updated' + n.toString());
      //   this.appinsightsService.setAuthenticatedUserContext(this.auth.user.name, this.auth.user.global_client_id);
     // this.messageData = n
    });
  }
 updateSchedule(refresh:boolean){
   let cntl=    this.note.presentLoading('Getting Messages...');
  this.messageList && this.messageList.closeSlidingItems();
     this._service.getMessages(this.queryText,this.segment,refresh).subscribe((data: any) => {
// this.events.publish('message:filtered', data.unreadCount);
console.log(data);
      this.shownMessages= data.shownMessages;
      this.groups = data;
    this.metrics = data.metrics;
      //      console.log('Grouped After Filter Data:',data);
      // this.groupedSurgeries =data.filter(w =>w.hide==false); //data.groupedSurgeries;
      // console.log('Grouped After Filter:', data.filter(w =>w.hide==false));
         console.log('getMessages',data);
       console.log('      this.shownMessages',       this.shownMessages)
       console.log('      this.groups',       this.groups)
             console.log('      this.metrics',       this.metrics)
          cntl.dismiss();
    //  this.groups = data.surgeryType;
    }); 
 }

  updateSegment() { 
         this.updateSchedule(false);
  
  }

  doRefresh(refresher)
  {
  this.groups=[];
    this.updateSchedule(true);
refresher.complete();
  }
 
  delete(msg?)
  {
console.log('Delete Message',msg);
    this._msgService.deleteMessage(msg).then((a)=>{
      console.log('Delete DONE',msg);
     this.groups=[];
    this.updateSchedule(true);
    });
 
  }
  reply(msg?)
  {
    // this.insight.trackEvent('Message Reply');
    let modal = this.modalCtrl.create(MessageReplyModal, { msg: msg });
    modal.present(); 
    modal.onWillDismiss((data: string) =>
    {     
       if (data) {   
           this.updateSchedule(false);
      }
    }); 
  }

  showDetails(msg: DoctorMessageModel) {

   /// this.insight.trackTrace('Message Detail');
    this.log.console('showing message detail', msg) ; 
    this.navCtrl.push(MessageDetailPage, msg);
  }


  showContactInfo(msg: any) {
    let mode = this.config.get('mode'); 
  // this.insight.trackEvent('Message Contact Info');  

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Contact ' + msg,
      buttons: [
        {
          text: `Email ( ${msg.email} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            window.open('mailto:' + msg.email);
          }
        },
        {
          text: `Call ( ${msg.phone} )`,
          icon: mode !== 'ios' ? 'call' : null,
          handler: () => {
            window.open('tel:' + msg.phone);
          }
        }
      ]
    });

    actionSheet.present();
  }
 


}
