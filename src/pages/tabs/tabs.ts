
import { Component } from '@angular/core';
import { NavParams, Platform, Events, LoadingController } from 'ionic-angular';
import { CalendarPage } from '../calendar/calendar';
import { PageInterface } from '../../app/app.component';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { AccountPage } from "../account/account";
import { PulsePage, SurgeryData } from "../pulse/index";
import { MessageListPage, MessageData, MessageService } from "../message/index";
 import { IonicNativePlugin } from '@ionic-native/core'
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  // this tells the tabs component which Pages
  // should be each tab's root Page
  loading: any;
  tab1Root: any = PulsePage;
  tab2Root: any =CalendarPage;
  tab3Root: any = MessageListPage;
  tab4Root: any = AccountPage; 
  tab5Root: any = AboutPage;
 
  pulseData: number = 0;
  messageData: number = 0;
  accountData: number = 0;
  futureData: number = 0;
  mySelectedIndex: number;
  isAndroid: boolean = false;
  constructor(navParams: NavParams, platform: Platform, public events: Events, private surgerySvc: SurgeryData, private messageSvc: MessageData,   private callNumber: CallNumber) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.isAndroid = platform.is('android');
    // this.pulseData = surgerySvc.metrics.today;
    // this.futureData = surgerySvc.metrics.future;
    // this.messageData = messageSvc.metrics.unread;
  }
  ionViewDidLoad() {
    this.loadListeners(); 
  }

  loadListeners() {
    // this.events.subscribe('surgery:metrics', (metrics) => {
    //   // user and time are the same arguments passed in `events.publish(user, time)`
    //   this.pulseData = metrics.today;
    //  // this.calendarData = metrics.pending;
    // });

    // this.events.subscribe('message:metrics', (metrics) => {
    //   console.log('MESSAGE METRICS EVENT222 ', metrics)
    //   this.messageData = metrics.unread
    // });
    this.events.subscribe('message:metrics', (metrics) => { 
 
      console.log('MESSAGE METRICS EVENT CAPTURED TABS PAGE ', metrics)
      this.messageData = metrics.unread 
 
    });
    this.events.subscribe('surgery:metrics', (metrics) => {
       console.group('Events');
      console.log('SURGERY METRICS EVENT CAPTURED TABS PAGE  ', metrics)
      this.pulseData = metrics.today;
      this.futureData = metrics.future; 
      //  this.appPages[0].badgeValue = metrics.today;
      //this.appPages[2].badgeValue = metrics.pending; 
    });

  }

} 