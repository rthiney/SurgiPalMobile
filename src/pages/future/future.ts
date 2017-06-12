
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Headers } from '@angular/http';
import { AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, LoadingController, Events } from 'ionic-angular';
import { FutureData, FutureDetailPage } from './index';
import { PulseViewModel } from './../../models/viewmodels/pulse_model';
import { AuthHttp } from 'angular2-jwt';
import { Pulse } from './../../models/pulse';

import { AuthService, NotifyService, LoggerService, CONFIGURATION } from "../../shared/index";

@Component({
  selector: 'page-future',
  templateUrl: 'future.html'
})
export class FuturePulsePage {
  @ViewChild('surgeryList', { read: List }) surgeryList: List;
  _events: Events;
  selectedPulse: any;
  dayIndex = 0;
  queryText = '';
  segment = 'not';
  excludeTracks: any = [];
  surgeries: PulseViewModel[];
  shownSurgeries: any;
  dates: any = [];
  confDate: string;
  groupedSurgeries = [];
  groups: any = [];
  date: Date;
  dateIndex: number = 0;
  private headers = new Headers({ 'Content-Type': 'application/json' });
  constructor(
    private authHttp: AuthHttp,
    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public auth: AuthService,
    public futureData: FutureData,
    public note: NotifyService,
    public log: LoggerService,
    public events: Events
  ) {
    this.date = new Date();
  }

  ionViewDidLoad() {

    // this.insight.trackPageView('Pulse');
    this.app.setTitle('Calendar');
    console.log('FOSID', this.auth.fosId);
    if (this.auth.fosId !== undefined)
      this.updateSchedule(null, true);
 
  }
 
  loadDetail(s: PulseViewModel) {
    // go to the session detail page
    // and pass in the session data 
    this.navCtrl.push(FutureDetailPage, s);
  }

  backDate() {
    this.dateIndex--;
    this.date.setDate(this.date.getDate() + this.dateIndex);
    console.log('Date Search', this.date);
    console.log('Date Index', this.dateIndex);
    this.updateSchedule(this.date, true);
  }
  forwardDate() {
    this.dateIndex++;
    this.date.setDate(this.date.getDate() + this.dateIndex);
    console.log('Date Search', this.date);
    console.log('Date Index', this.dateIndex);
    this.updateSchedule(this.date, true);
  }

  updateSchedule(d: Date = null, reset: boolean = false) {
    let cntl = this.note.presentLoading('Loading Future Pulse');
    // Close any open sliding items when the schedule updates
    this.surgeryList && this.surgeryList.closeSlidingItems();
    this.futureData.getSurgeries(this.queryText, this.excludeTracks, this.segment, d, reset).subscribe((data: any) => {
      this.shownSurgeries = data.futureSurgeries;
      this.groups = data;

    });
    cntl.dismiss();

  }

  doRefresh(refresher) {
    this.updateSchedule();
    refresher.complete();
  }
  private handleError(error: any): Promise<any> {
    console.log(error.message || error);
    let alert = this.note.alertCtrl.create({
      title: 'Error',
      subTitle: error.message || error,
      buttons: ['OK']
    });
    alert.present();
    console.log('SERVICE ERROR', error.message || error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  showDetail(s: PulseViewModel) {
    // go to the session detail page
    // and pass in the session data 
    this.navCtrl.push(FutureDetailPage, s);
  }

}
