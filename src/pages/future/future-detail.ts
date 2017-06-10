import { PulseViewModel } from './../../models/viewmodels/index';
 
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular'; 
@Component({
  selector: 'page-surgery-detail',
  templateUrl: 'future-detail.html'
})
export class FutureDetailPage {
  surgery: PulseViewModel;
  constructor(public navParams: NavParams) {
    this.surgery = navParams.data;
  }
}
