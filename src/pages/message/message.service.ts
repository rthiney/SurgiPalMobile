

import { Injectable } from '@angular/core'; 
import { FormGroup,FormBuilder } from '@angular/forms';
import { Http } from "@angular/http";
import { AuthService, CONFIGURATION, LoggerService } from "../../shared/index"; 
import {DoctorMessageModel} from '../../models/viewmodels'; 
import { DoctorMessage  } from '../../models/DoctorMessage'; 
import { AuthHttp } from 'angular2-jwt';
 

@Injectable()
export class MessageService
{

  constructor(private authHttp: AuthHttp, private auth: AuthService, private log : LoggerService)
  {
  }
  getAll(): Promise<DoctorMessageModel[]>
  {
         this.log.console('getAll:' );
  var url = CONFIGURATION.baseUrls.apiUrl + 'messages/doctors/' + this.auth.fosId;
 // var url =CONFIGURATION.apiUrls.message + '?transform=1&order=created_at,desc&filter[]=user_id,eq,' + this.auth.fosId
    console.log('Message URL:', url);
    return this.authHttp.get(url)
      .toPromise()
      .then(response => response.json() as DoctorMessageModel[])
      .catch(this.handleError);
  }


  sendEmail(emailForm: FormGroup): Promise<DoctorMessageModel>
{
         this.log.console('sendEmail:' );
    var url = CONFIGURATION.baseUrls.apiUrl + 'messages';
    console.log(emailForm.value);
    this.log.console('sendEmail:', emailForm);
  return this.authHttp
    .post(url,  emailForm.value  )
    .toPromise()
    .then(res => res.json())
    .catch(this.handleError);
} 
  get(id: number): Promise<DoctorMessage>
  {

        this.log.console('get:' );
    const url = CONFIGURATION.baseUrls.apiUrl + 'messages/'+ id;
    return this.authHttp.get(url)
      .toPromise()
      .then(response => response.json() as DoctorMessage)
      .catch(this.handleError);
  }

  update(msg: DoctorMessageModel): Promise<DoctorMessage> {
 
           this.log.console('MessageService:update:' );
    const url = `${CONFIGURATION.baseUrls.apiPhp + 'doctor_message'}/${msg.id}`;
  var newData = {
             viewcount:23
          };
    return this.authHttp
      .put(url, JSON.stringify(newData) )
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }

  markRead(msg: DoctorMessageModel): Promise<DoctorMessage> {
 
           this.log.console('MessageService:markread:' );
    const url = `${CONFIGURATION.baseUrls.apiPhp + 'doctor_message'}/${msg.id}`;
  var newData = {
             viewed:true
          };
    return this.authHttp
      .put(url, JSON.stringify(newData) )
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }
  deleteMessage(msg: DoctorMessageModel): Promise<DoctorMessage> {
           this.log.console('update:' );
    const url = `${CONFIGURATION.baseUrls.apiPhp + 'doctor_message'}/${msg.id}`;
 
    return this.authHttp
      .delete(url  )
      .toPromise()
      .then(() => msg)
      .catch(this.handleError);
  }

  private handleError(error: any)
  {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error('handleError in Message Servicess', errMsg); // log to console instead
    return errMsg;
  }
}
