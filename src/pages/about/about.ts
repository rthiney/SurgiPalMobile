import { Component } from '@angular/core';

import { PopoverController } from 'ionic-angular';

import { PopoverPage } from '../about-popover/about-popover';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html' 
})
export class AboutPage { 
info: string = "services";

  constructor(public popoverCtrl: PopoverController) { }

  presentPopover(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

  openurl(url: string) {
    window.open(url, '_blank'); 
  }
}
