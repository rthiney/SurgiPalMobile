import { CalendarPage } from './../calendar/calendar';
import { PageInterface } from '../../app/app.component';

import { Component } from '@angular/core';
import { NavParams, Platform, Events, LoadingController } from 'ionic-angular';

import { HomePage } from '../home/home';
import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { AccountPage } from "../account/account";
import { PulsePage, SurgeryData } from "../pulse/index";
import { MessageListPage, MessageData, MessageService } from "../message/index";
import { FuturePulsePage } from "../future/index";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {


 

  // this tells the tabs component which Pages
  // should be each tab's root Page
  loading: any;
  tab1Root: any = PulsePage;
  tab2Root: any = FuturePulsePage;
  tab3Root: any = MessageListPage;
  tab4Root: any = AccountPage; 
  tab5Root: any = AboutPage;
 
  pulseData: number = 0;
  messageData: number = 0;
  accountData: number = 0;
  futureData: number = 0;
  mySelectedIndex: number;
  isAndroid: boolean = false;
  constructor(navParams: NavParams, platform: Platform, public events: Events, public surgerySvc: SurgeryData, public messageSvc: MessageData) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.isAndroid = platform.is('android');

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
      console.log('MESSAGE METRICS EVENT ', metrics)
      this.messageData = metrics.unread 
    });
    this.events.subscribe('surgery:metrics', (metrics) => {
      console.log('SURGERY METRICS EVENT  ', metrics)
      this.pulseData = metrics.today;
      this.futureData = metrics.pending;
      //  this.appPages[0].badgeValue = metrics.today;
      //this.appPages[2].badgeValue = metrics.pending;

    });


  }

}
