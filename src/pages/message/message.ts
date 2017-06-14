import { MessageService } from './message.service';
import { MessageMetrics, MessageGroupItem } from './../../models/metrics';
import { DoctorMessageModel } from './../../models/viewmodels';
import { MessageReplyModal } from './message-reply';

import { Component, ViewChild } from '@angular/core';
import { ActionSheet, ActionSheetController, Config, NavController, LoadingController, App, ModalController, ToastController, Events, List } from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';
import { MessageDetailPage } from '../message-detail/message-detail';

import { AuthService, NotifyService, LoggerService } from "../../shared/index";
import { DoctorMessage } from "../../models/DoctorMessage";
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
  shownMessages: any;
  metrics: MessageMetrics;
  dates: any = [];
  confDate: string;
  groupedMessages = [];
  actionSheet: ActionSheet;
  messages: MessageGroupItem[] = [];
  messagesRead: MessageGroupItem[] = [];
  messagesUnread: MessageGroupItem[] = [];
  segment = 'unread';
  constructor(
    public app: App,
    private auth: AuthService,
    private _service: MessageData,
    private _msgService: MessageService,
    public actionSheetCtrl: ActionSheetController,
    public navCtrl: NavController,
    public modalCtrl: ModalController,
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
    console.log('FOSID', this.auth.fosId);
    if (this.auth.fosId !== undefined)

      this.updateSchedule(false);

  }

  subscribeToEvents() {
    this.events.subscribe('messagedata:markedRead', (n) => {
      console.log('EVENT CAPTURED: messagedata:markedRead', n);
      //  alert('messagedata:markedRead' + n.toString());

      // if (this.segment == "unread") {
      //   var index: number = this.messages.indexOf(n, 0);
      //   this.messages.splice(index, 1);
      //   this.updateSchedule(true);
      // }
      this.updateSchedule(true);
      //  this.messageData = n
    });
 
  }
  updateSchedule(refresh: boolean = false, refresher: any = null) {
    let cntl = this.note.presentLoading('Getting Messages...');
    this.messages = null;
    this.metrics = null;
    this.messageList && this.messageList.closeSlidingItems();

    try { 
      this._service.getMessages(this.queryText, this.segment, refresh).subscribe((data: any) => {
        // this.events.publish('message:filtered', data.unreadCount);
        this.messages = (this.segment == "read") ? this._service.readMessages : (this.segment == "unread") ? this._service.unreadMessages : this._service.messages;
        this.metrics = this._service.metrics;
        //      console.log('Grouped After Filter Data:',data);
        // this.groupedSurgeries =data.filter(w =>w.hide==false); //data.groupedSurgeries;
        // console.log('Grouped After Filter:', data.filter(w =>w.hide==false));
        if (refresher)
          refresher.complete();
        console.log('      this.messages', this.messages)
        console.log('      this.metrics', this.metrics)

        //  this.groups = data.surgeryType;
      }, err => {
        console.error(err);
        cntl.dismiss();
      });
    } catch (error) {
      console.error(error);
      cntl.dismiss();
    }
    cntl.dismiss();
  }

  updateSegment() {
    this.updateSchedule(false);
  }

  doRefresh(refresher) {
    this.auth.storage.remove('messagesStoreDate');
    this.auth.storage.remove('messages');
    this.updateSchedule(true, refresher);

  }

  delete(msg?) {
    console.log('Delete Message', msg);
    this._msgService.deleteMessage(msg).then((a) => {
      console.log('Delete DONE', msg);
      this.messages = [];
      this.updateSchedule(true);
    });
  }

  deleteGroup(grp: any) {
 
    grp.messages.forEach((g: DoctorMessageModel) => {
      this._msgService.deleteMessage(g.message).then((a) => {
        console.log('Delete DONE', g.message);
        
      });
    });
 
  }

  reply(msg?) {
    // this.insight.trackEvent('Message Reply');
    let modal = this.modalCtrl.create(MessageReplyModal, { msg: msg });
    modal.present();
    modal.onWillDismiss((data: string) => {
      if (data) {
        this.updateSchedule(false);
      }
    });
  }
  showDetails(msg: MessageGroupItem) {
    // this.insight.trackEvent('Message Reply');
    let modal = this.modalCtrl.create(MessageDetailPage, msg );
    modal.present();
    modal.onWillDismiss((data: string) => {
      if (data) {
        this.updateSchedule(false);
      }
    });
  }
  showDetails2(msg: MessageGroupItem) {
    /// this.insight.trackTrace('Message Detail'); 
    this.log.console('showing message detail', msg);
    this.navCtrl.push(MessageDetailPage, msg);
  }
  failure(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    this.log.error(errMsg); // log to console instead
    return errMsg;
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
