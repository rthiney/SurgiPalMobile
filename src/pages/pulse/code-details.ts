import { PulseViewModel } from './../../models/viewmodels/pulse_model';

import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
@Component({
  templateUrl: 'code-details.html'
})
export class CodeDetails {
  pulse: any;
  codeType: string;
  codes: string[];
  removedCodes: string[] = [];
  constructor(params: NavParams, public viewCtrl: ViewController) {
    this.pulse = params.get('pulse');
    this.codeType = params.get('type');
    this.codes = params.get('codes');
this.codes.sort();
 
  }


  dismiss(data?: any) {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss(this.pulse);
  }
  revert() {
    this.removedCodes.forEach(c => {
      this.codes.push(c);
    });
      this.removedCodes=[];
      this.codes.sort();
  }

  save() {
     

  }
  delete(chip: Element) {
    console.log(chip.textContent.trim() + ',')
    this.removedCodes.push(chip.textContent.trim());
  //this.pulse.cptArray.pop(chip.textContent.trim()); 
    chip.remove();
  }
}
