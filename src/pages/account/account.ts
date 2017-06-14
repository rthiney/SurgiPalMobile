import { LoginPage } from './../login/login';
 
import {SurgeryData} from '../pulse/index';
import { HockeyApp } from 'ionic-hockeyapp';
import {AuthService} from '../../shared/auth.service';
import {AboutPage} from '../about/about';  
import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController, NavController, Platform, Events } from 'ionic-angular';
 
import {SupportPage} from '../support/support'; 
import { NotifyService } from "../../shared/index";
import { MessageData } from "../message/index";
import { SurgeryMetrics,MessageMetrics } from "../../models/metrics";
 declare  var google:any;

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'

})
export class AccountPage {
  _hockeyapp: any;
  events: any;

  username: string;
  surgeryCardMetrics:any;
  surgeryMetrics: SurgeryMetrics;
  messageMetrics:MessageMetrics;
  @ViewChild('mapCanvas') mapElement: ElementRef;
 
  constructor(public alertCtrl: AlertController, public nav: NavController, public auth: AuthService,public platform: Platform, public event:Events ,public _note: NotifyService,   _hockeyapp: HockeyApp,
        private surgerySvc: SurgeryData, private messageSvc: MessageData) {

  }
  ionViewDidLoad() {

  //      var myCenter = new google.maps.LatLng(this.auth.latitude,this.auth.longitude);
  //        var mapProp =   {
  //         center: myCenter,
  //         zoom: 25
  //      };
  //  let mapEle = this.mapElement.nativeElement;
  //    var map=new google.maps.Map(mapEle,mapProp);
    
  //         let infoWindow = new google.maps.InfoWindow({
  //           content: `<h5>${this.auth.name}</h5>`
  //         });

  //         let marker = new google.maps.Marker({
  //           position: myCenter,
  //           map: map, 
  //           title: this.auth.name
  //         });

  //         marker.addListener('click', () => {
  //           infoWindow.open(map, marker);
  //         });
      
  //       google.maps.event.addListenerOnce(map, 'idle', () => {
  //        map.classList.add('show-map');
  //       });
 
  }
 
  ngAfterViewInit() {
    this.getUsername();

this.surgeryMetrics = this.surgerySvc.metrics;
    this.surgeryCardMetrics = this.surgerySvc.metrics.cards;
this.messageMetrics = this.messageSvc.metrics;
      // this.events.subscribe('surgery:metrics', (metrics) => {
      //       console.log('SURGERY METRICS EVENT ACCOUNT  ', metrics)
      //     this._hockeyapp.trackEvent(null, null, 'Account Metrics Callback');
      //     this.surgeryMetrics =this.surgerySvc.metrics;
      //   });
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  changeUsername() {
    let alert = this.alertCtrl.create({
      title: 'Change Username',
      buttons: [
        'Cancel'
      ]
    });
    alert.addInput({
      name: 'username',
      value: this.auth.name,
      placeholder: 'username'
    });
    alert.addButton({
      text: 'Ok',
      handler: (data: any) => {
        this.auth.name = data.username;
        this.getUsername();
      }
    });

    alert.present();
  }
  getPicture() {
    if (this.auth.picture)
    return this.auth.picture;
    else
    return '/assets/img/person-flat.png'; 
  }
  getUsername() {
  return this.auth.name;
  }

  changePassword() {
    console.log('Clicked to change password');
  }

  logout() {
    this.auth.logout();
    this.nav.setRoot(LoginPage);
  }

  support() {
    this.nav.push(SupportPage);
  }
}
