
import { SendGridVars, AzureMobile } from './../../shared/app.constants';
import { AuthService } from './../../shared/auth.service';
///import { AppInsightsService } from "ng2-appinsights";
import { MessageService } from './message.service';
import { Component } from '@angular/core';
import { Platform, NavParams, ViewController, App } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DoctorMessageModel } from '../../models/viewmodels';
import * as sendgrid from 'sendgrid'
import azureMobileClient from 'azure-mobile-apps-client';
declare var require: any;
@Component({
  templateUrl: './message-reply.html'
})
export class MessageReplyModal {

  private mailForm: FormGroup;
  message: DoctorMessageModel;
  client: any;
  table: any;
  //surgery?:Surgery;
  constructor(
    private formBuilder: FormBuilder,
    private _service: MessageService,
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    this.message = params.get('msg');
    this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
    this.table = this.client.getTable('MessagesData');
    //this.surgery = this.params.get('s');
    if (this.message === undefined) {
      // this.message = new DoctorMessage(-1, '');
      this.message = "Add Message";
    }
    this.mailForm = this.formBuilder.group({
      to: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      from: ['', Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      subject: ['RE:' + this.message.subject, Validators.compose([Validators.minLength(5), Validators.maxLength(255), Validators.required])],
      message: ['', Validators.compose([Validators.minLength(10), Validators.maxLength(1000), Validators.required])]
    });
 //   this.saveToMobileClientTable();

  }

  saveToMobileClientTable() {
    console.log('saveToMobileClientTable', this.message)
 
    this.table
      .where({ message_id: this.message.id })
      .read()
      .then(res => {
        console.log('Read Table Response : ' + res);
        if (!res[0]) {
          this.createMessageData()
        } else {

          var updateData = { id: res[0].id, viewcount: res[0].viewcount + 1 };
          console.log('Updated count ==>', updateData);
          this.table.update(updateData).done(function (updatedItem) {
            
          }, this.failure);
        }
        console.log(res)
      }
      , this.failure);
  }

  updateMessageDate(res: any) {
    var updateData = { id: res.id, viewcount: res.viewcount + 1 };
    this.table.update(updateData).done(function (updatedItem) {
     // this.log.console('Updated count to : ' + updatedItem.viewcount)
    }, this.failure);
  }

  createMessageData() {
    try {
      console.log(' CREATING MessageData', this.message)
      this.table.insert(
        { message_id: this.message.id, viewcount: 1,replied_at: new Date() }
      )
        .then(function (response) {

        }, function (error) {
        });
    }
    catch (e) {
      console.error(' createMessageData()', e)
    }
  }



  exists(messageData) {

  }
  send() {
    try {


      var helper = require('sendgrid').mail;
      var from_email = new helper.Email('raphael@surgipal.com');
      var to_email = new helper.Email('raphael.thiney@gmail.com');
      var subject = 'I\'m replacing the subject tag~!!!!';
      var content = new helper.Content(
        'text/html', 'I\'m replacing the <strong>body tag</strong>');
      var mail = new helper.Mail(from_email, subject, to_email, content);
      mail.setTemplateId(SendGridVars.billingTemplate);
      var personalization = mail.getPersonalizations();
      personalization[0].addSubstitution(new helper.Substitution('-surgeon-', 'Me Surgeon'));
      personalization[0].addSubstitution(new helper.Substitution('-patient-', 'Me Patient'));
      personalization[0].addSubstitution(new helper.Substitution('-surgerydate-',  '1/1/2009'));
          personalization[0].addSubstitution(new helper.Substitution('-surgerytime-', '2:33pm'));
                  personalization[0].addSubstitution(new helper.Substitution('-messageid-', this.message.id));
      personalization[0].addSubstitution(new helper.Substitution('-cpt-',  'cpt codeds'));
          personalization[0].addSubstitution(new helper.Substitution('-dx-', 'dxcodes'));



      var sg = require('sendgrid')(SendGridVars.key);
      //  var sg = sendgrid(SendGridVars.key)
      var request = sg.emptyRequest({
        method: 'POST',
        mode: 'no-cors',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });



      sg.API(request, function (error, response) {
        if (error) {
          console.log('SEND GRID  response received');
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
      });



    } catch (e) {
      debugger;
      console.error(e)
    }
    // //With promise
    // sg.API(request)
    //   .then(response => {
    //     console.log(response.statusCode);
    //     console.log(response.body);
    //     console.log(response.headers);
    //   })
    //   .catch(error => {
    //     //error is an instance of SendGridError
    //     //The full response is attached to error.response
    //     console.log(error.response.statusCode);
    //   });

  }


  sendEmail() {
    if (this.mailForm.get('subject').value !== null) {
      this._service.sendEmail(this.mailForm).then(data => {
        this.dismiss('Sent reply email:' + this.mailForm.get('subject').value);
      })
        .catch(error => {
          this.dismiss('Error: ' + error.toString());
        });
    }
    else {
      this.dismiss('Dint send it...');
    }
  }

  dismiss(msg: string) {
    this.viewCtrl.dismiss(msg);
  }

  failure(error: any) {
    this.createMessageData();
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error('handleError in Message Reply Page', errMsg); // log to console instead
    return errMsg;
  }
}
