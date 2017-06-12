import { Component, ElementRef, Renderer, ErrorHandler } from '@angular/core';
import { HockeyApp } from 'ionic-hockeyapp';
import { SendGridVars } from './../../shared/app.constants';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { ModalController, NavParams, ViewController, Events } from 'ionic-angular';
import { PulseViewModel } from './../../models/viewmodels/pulse_model';
declare var require: any; 
@Component({
  templateUrl: 'billing-details.html'
})
export class BillingDetails {
  pulseItem: any;
  surgery: PulseViewModel;
  mailForm: FormGroup;
  _events: Events;

  constructor(private formBuilder: FormBuilder,
    public params: NavParams, public hockeyapp: HockeyApp,
    public viewCtrl: ViewController, public event: Events) {

    this._events = event;
    this.pulseItem = params.data;
    this.surgery = this.pulseItem.surgery;
    this.mailForm = this.formBuilder.group({
      to: [this.pulseItem.surgery.billingCoordinatorEmail, Validators.compose([Validators.minLength(0), Validators.maxLength(255), Validators.required])],
      from: [this.pulseItem.surgery.doctorEmail, Validators.compose([Validators.minLength(0), Validators.maxLength(255), Validators.required])],
      message: ['', Validators.compose([Validators.minLength(0), Validators.maxLength(255), Validators.required])]
    });

  }
  sendEmail2() {

  }
  dismiss() {
    // using the injected ViewController this page
    // can "dismiss" itself and pass back data
    this.viewCtrl.dismiss();
  }
  sendEmail() {
    try {

      console.group('Send Email');
      console.log('Surgery', this.surgery);
      let d = new Date(this.surgery.term);

      var helper = require('sendgrid').mail;
      console.log('Mail Form', this.mailForm);
      var from_email = new helper.Email(this.surgery.doctorEmail);
      var to_email = new helper.Email(this.surgery.billingCoordinatorEmail);
      //     var from_email = new helper.Email('raphael@surgipal.com');
      // var to_email = new helper.Email('raphael.thiney@gmail.com');
      var subject = 'Billing Information for ' + this.surgery.initials + ' performed on ' + this.surgery.patient;
      var content = new helper.Content(
        'text/html', 'I\'m replacing the <strong>body tag</strong>');
      var mail = new helper.Mail(from_email, subject, to_email, content);
      var personalization = mail.getPersonalizations();
      personalization[0].addSubstitution(new helper.CustomArgs('-surgeon-', 'Me Surgeon'));
      personalization[0].addSubstitution(new helper.Substitution('-patient-', 'Me Patient'));

      personalization[0].addSubstitution(new helper.Substitution('-surgeon-', this.surgery.firstName + ' ' + this.surgery.lastName));
      personalization[0].addSubstitution(new helper.Substitution('-patient-', this.surgery.initials));
      personalization[0].addSubstitution(new helper.Substitution('-surgeryname-', this.surgery.patient));

      personalization[0].addSubstitution(new helper.Substitution('-cpt-', this.surgery.cpt));
      personalization[0].addSubstitution(new helper.Substitution('-dx-', this.surgery.diagnosisCode));

      personalization[0].addSubstitution(new helper.Substitution('-surgerydate-', d.toLocaleDateString()));
      personalization[0].addSubstitution(new helper.Substitution('-surgerytime-', d.toLocaleTimeString()));
      personalization[0].addSubstitution(new helper.Substitution('-messageid-', this.surgery.surgeryId.toString()));
      mail.setTemplateId(SendGridVars.billingTemplate);
      var sg = require('sendgrid')(SendGridVars.key);

      console.log(mail.toJSON())
      // var sg = sendgrid(SendGridVars.key)
      var request = sg.emptyRequest({
        method: 'POST',
        mode: 'no-cors',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });

      //With promise
      sg.API(request)
        .then(response => {
          this._events.publish('email:billing', this.surgery);
          console.log(response.statusCode);
          console.log(response.body);
          console.log(response.headers);
          console.groupEnd();
          this.hockeyapp.trackEvent('Send Email Sucess!' + response.toJson());
        })
        .catch(error => {
          console.groupEnd();
          //error is an instance of SendGridError
          //The full response is attached to error.response
          this.hockeyapp.trackEvent('Send Email Response Error' + error.toString());
          console.error(error.response.statusCode);
        });

      // sg.API(request, function (error, response) {
      //   if (error) {
      //     console.log('Error response received');
      //   }

      //       console.log('SEND SUCCESS!');
      //       this._events.publish('email:billing', response);

      // });
    }
    catch (e) {
      console.error(e);
      this.hockeyapp.trackEvent('Send Email Error');
      console.groupEnd();
    }
    this.dismiss();
  }
}
