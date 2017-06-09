import {AuthService} from '../../shared/auth.service';
import {AboutPage} from '../about/about';  
import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController, NavController, Platform } from 'ionic-angular';
 
import {SupportPage} from '../support/support'; 
declare var google: any;

@Component({
  selector: 'page-account',
  templateUrl: 'account.html'

})
export class AccountPage {
  
  username: string;
   
  @ViewChild('mapCanvas') mapElement: ElementRef;
 
  constructor(public alertCtrl: AlertController, public nav: NavController, public auth: AuthService,public platform: Platform) {

  }
  ionViewDidLoad() {

       var myCenter = new google.maps.LatLng(this.auth.latitude,this.auth.longitude);
         var mapProp =   {
          center: myCenter,
          zoom: 16
       };
   let mapEle = this.mapElement.nativeElement;
     var map=new google.maps.Map(mapEle,mapProp);
    
          let infoWindow = new google.maps.InfoWindow({
            content: `<h5>${this.auth.name}</h5>`
          });

   


          let marker = new google.maps.Marker({
            position: myCenter,
            map: map, 
            title: this.auth.name
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
      

        google.maps.event.addListenerOnce(map, 'idle', () => {
         // map.classList.add('show-map');
        });
 

  }
 
  ngAfterViewInit() {
    this.getUsername();
    console.log('Clicked to update picture');
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
    this.nav.setRoot(AboutPage);
  }

  support() {
    this.nav.push(SupportPage);
  }
}
