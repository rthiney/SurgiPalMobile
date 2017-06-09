import { PulseViewModel } from './../../models/viewmodels/index';
 
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular'; 
@Component({
  selector: 'page-surgery-detail',
  templateUrl: 'surgery-detail.html'
})
export class SurgeryDetailPage {
  surgery: PulseViewModel;
  constructor(public navParams: NavParams) {
    this.surgery = navParams.data;
  }
}
