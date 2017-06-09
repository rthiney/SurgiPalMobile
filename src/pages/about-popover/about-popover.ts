import { Component } from '@angular/core';

import { ViewController, NavController, App, ModalController } from 'ionic-angular';

import { SupportPage } from '../support/support';


@Component({
  template: `
    <ion-list>
      <button ion-item (click)="close('http://surgipal.com')">surgipal.com</button>
       <button ion-item (click)="close('http://surgipal.azurewebsites.net')">New surgipal.com</button>
      <button ion-item (click)="support()">Support</button>
    </ion-list>
  `
})
export class PopoverPage {

  constructor(
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public app: App,
    public modalCtrl: ModalController
  ) { }

  support() {
    this.app.getRootNav().push(SupportPage);
    this.viewCtrl.dismiss();
  }

  close(url: string) {
    window.open(url, '_blank');
    this.viewCtrl.dismiss();
  }
}
