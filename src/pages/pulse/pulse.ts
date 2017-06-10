
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Headers } from '@angular/http';
import { AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, LoadingController, Events } from 'ionic-angular';
import { BillingDetails, CodeDetails, SurgeryData, SurgeryDetailPage } from './index';
import { PulseViewModel } from './../../models/viewmodels/pulse_model';
import { AuthHttp } from 'angular2-jwt';
import { Pulse } from './../../models/pulse';

import { AuthService, NotifyService, LoggerService, CONFIGURATION } from "../../shared/index";

@Component({
  selector: 'page-schedule',
  templateUrl: 'pulse.html'
})
export class PulsePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
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
    public surgeryData: SurgeryData,
    public note: NotifyService,
    public log: LoggerService,
    public events: Events
  ) {
    this.date = new Date();
  }

  ionViewDidLoad() {

    // this.insight.trackPageView('Pulse');
    this.app.setTitle('Todays Pulse');
    console.log('FOSID', this.auth.fosId);
    if (this.auth.fosId !== undefined)
      this.updateSchedule();
    this.loadWatchers();
  }
  loadWatchers() {
    this.events.subscribe('email:billing', (data) => {

      this.note.presentToast('Success', data.statusCode);
    });
  }
    
  
  // backDate() { 
  //   this.dateIndex++;
  //   this.date.setDate(this.date.getDate() + this.dateIndex);
  // }
  // forwardDate() {
  //   this.dateIndex--;
  //   this.date.setDate(this.date.getDate() + this.dateIndex);
  // }


  updateSchedule(reset: boolean = false) {

    let cntl = this.note.presentLoading('Loading Todays Pulse...');
    // Close any open sliding items when the schedule updates
    this.surgeryList && this.surgeryList.closeSlidingItems();

    this.surgeryData.getSurgeries(this.queryText, this.excludeTracks, this.segment, reset).subscribe((data: any) => {
      this.events.publish('pulse:filtered', data.shownSurgeries);
      console.log('getSurgeries', data);
      this.shownSurgeries = data.shownSurgeries;
      this.groups = data;

      //      console.log('Grouped After Filter Data:',data);
    /// this.groupedSurgeries =data.filter(w =>w.hide==false); //data.groupedSurgeries;
      // console.log('Grouped After Filter:', data.filter(w =>w.hide==false));
      console.log('      this.shownSurgeries', this.shownSurgeries)
      console.log('      this.groups', this.groups)

      //  this.groups = data.surgeryType;
    });
    cntl.dismiss();
    //  cntl.dismiss();
    //  this.surgeryData.getSurgeries(this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
    //       this.shownSurgeries = data.shownSessions;
    //       this.dates = data.dates;
  }

  //    let cntl = this.note.presentLoading('Loading Todays Pulse...');
  //       let qt = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
  //       let queryWords = qt.split(' ').filter(w => !!w.trim().length);

  //     this._service.getAll().then(data =>
  //     { 
  //       console.log('Pulse Data:', data); 
  //       this.surgeries = data;

  //     this.surgeries.forEach((surgery: PulseViewModel) => {

  // console.log(surgery.initials);
  //       if (!surgery.completed && this.segment==='not') 
  //             this.shownSurgeries.push(surgery); 
  //             if (surgery.completed && this.segment==='completed') 
  //             this.shownSurgeries.push(surgery); 

  //       if (queryWords.length) {
  //       // of any query word is in the session name than it passes the query test
  //       queryWords.forEach((queryWord: string) => {
  //         if (surgery.cpt.toLowerCase().indexOf(queryWord) > -1) {
  //           this.shownSurgeries.push(surgery); 
  //         } else if (surgery.diagnosisCode.toLowerCase().indexOf(queryWord) > -1) {
  //           this.shownSurgeries.push(surgery);

  //         } else if (surgery.prefereceCardName.toLowerCase().indexOf(queryWord) > -1) {
  //           this.shownSurgeries.push(surgery);

  //         } else if (surgery.patient.toLowerCase().indexOf(queryWord) > -1) {
  //           this.shownSurgeries.push(surgery);
  //         }else if (surgery.initials.toLowerCase().indexOf(queryWord) > -1) {
  //           this.shownSurgeries.push(surgery);
  //         }
  //       });
  //     }        

  //  });

  //  cntl.dismiss();
  // })
  //  .catch(this.handleError);
  // .catch(error =>
  // { 

  // });

  // this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) =>
  // {
  //   this.shownSessions = data.shownSessions;
  //   this.groups = data.groups;
  // });

  // this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
  //   this.shownSessions = data.shownSessions;
  //   this.groups = data.groups;
  // });
  // }

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

  presentFilter() {
    //let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    //modal.present();

    //modal.onWillDismiss((data: any[]) => {
    //  if (data) {
    //    this.excludeTracks = data;
    //    this.updateSchedule();
    //  }
    //});
  }

  showDetail(s: PulseViewModel) {
    // go to the session detail page
    // and pass in the session data 
    this.navCtrl.push(SurgeryDetailPage, s);
  }

  addFavorite(slidingItem: ItemSliding, sessionData: any) {

    // if (this.user.hasFavorite(sessionData.name)) {
    //   // woops, they already favorited it! What shall we do!?
    //   // prompt them to remove it
    //   this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    // } else {
    //   // remember this session as a user favorite
    //   this.user.addFavorite(sessionData.name);

    //   // create an alert instance
    //   let alert = this.alertCtrl.create({
    //     title: 'Favorite Added',
    //     buttons: [{
    //       text: 'OK',
    //       handler: () => {
    //         // close the sliding item
    //         slidingItem.close();
    //       }
    //     }]
    //   });
    //   // now present the alert on top of all other content
    //   alert.present();
    // }
  }

  removeFavorite(slidingItem: ItemSliding, sessionData: any, title: string) {
    // let alert = this.alertCtrl.create({
    //   title: title,
    //   message: 'Would you like to remove this session from your favorites?',
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       handler: () => {
    //         // they clicked the cancel button, do not remove the session
    //         // close the sliding item and hide the option buttons
    //         slidingItem.close();
    //       }
    //     },
    //     {
    //       text: 'Remove',
    //       handler: () => {
    //         // they want to remove this session from their favorites
    //         this.user.removeFavorite(sessionData.name);
    //         this.updateSchedule();

    //         // close the sliding item and hide the option buttons
    //         slidingItem.close();
    //       }
    //     }
    //   ]
    // });
    // // now present the alert on top of all other content
    // alert.present();
  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.note.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }
  loadDetail(p: PulseViewModel) {
    this.selectedPulse = p;
    this.log.event('Loaded Pulse Detail');
  }

  cancelSurgery(pulse: any, p: Element) {
    this.selectedPulse = pulse;
    console.log('cancelling', pulse.patient.toString());
    p.remove();
  }

  sendBilling(p: any) {
    let profileModal = this.modalCtrl.create(BillingDetails, p, {
      enterAnimation: 'modal-slide-in',
      leaveAnimation: 'modal-slide-out'
    });
    profileModal.present();

    profileModal.onWillDismiss(() => {
      // console.log('sendBilling() .onWillDismiss', data);
      // if (data.statusCode<300){
      // let tst = this.note.presentToast ('Success', data.statusCode);
      // tst.present();
      // }
      // if (data) {
      //   this.selectedPulse = data;
      //   this.updateSchedule();
      // }
    });
  }

  showEditCodes(p: any, codeType: string) {
    console.log('Selected Pulse Id ', p.surgery.surgeryId);

    // var codes:string[];
    let c = (codeType === 'CPT') ? p.cptArray : p.dxArray;

    let profileModal = this.modalCtrl.create(CodeDetails, { pulse: p, codes: c, type: codeType }, {
      enterAnimation: 'modal-slide-in',
      leaveAnimation: 'modal-slide-out'
    });
    profileModal.present();

    profileModal.onWillDismiss((data: any[]) => {
      console.log('onWillDismiss', data);
      if (data) {
        this.selectedPulse = data;
        this.updateSchedule();
      }
    });

  }

  // addHospital()
  // {
  //   console.log('Add Hospital Clicked');
  //   this.navCtrl.push(AddhospitalPage);
  // }
  // addStaff()
  // {
  //   console.log('Add Staff Clicked');
  //   this.navCtrl.push(StaffPage);
  // }
  // addSurgery()
  // {
  //   this.navCtrl.push(AddsurgeryPage);
  // }

  // presentLoading()
  // {
  //   let loader = this.note.loadingCtrl.create({
  //     content: "Checking pulse...",
  //     duration: 5000,
  //     dismissOnPageChange: true
  //   });
  //   loader.present();
  // }

  // presentAlert(message:string){
  //   let alert = this.note.alertCtrl.create({
  //     title: 'Alert',
  //     buttons: [{
  //       text: 'OK',
  //       handler: () =>
  //       {
  //         // close the sliding item
  //        // slidingItem.close();
  //       }
  //     }]
  //   });
  //   // now present the alert on top of all other content
  //   alert.present();
  // }
}
