import { CalendarPage } from './../pages/calendar/calendar';
import { MessageService } from './../pages/message/message.service';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from "@angular/platform-browser";
import { Http, HttpModule } from "@angular/http";
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AuthConfig, AuthHttp } from 'angular2-jwt'; 
import { StatusBar, Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';
//3rd Party
import { MomentModule } from 'angular2-moment';
import { AppInsightsModule, AppInsightsErrorHandler } from 'ng2-appinsights';
 
//General Components
import { SurgiPalApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { SupportPage } from '../pages/support/support';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
//SuurgiPal Components
import { PulsePage, SurgeryDetailPage, CodeDetails, BillingDetails, SurgeryData } from "../pages/pulse/index";
import { MessageListPage, MessageReplyModal, MessageData, MessageDetailPage } from "../pages/message/index";
import { AuthService, NotifyService, LoggerService } from "../shared/index";
import { HockeyApp } from 'ionic-hockeyapp';
import { AddSurgeryComponent } from "../pages/add-surgery/add-surgery.component"; 
//TEST, FutureData  
 import { IonicNativePlugin } from '@ionic-native/core'
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
import { LoginPage } from "../pages/login/login";
let storage = new Storage();

export function getAuthHttp(http) {
    return new AuthHttp(new AuthConfig({
       // headerPrefix: YOUR_HEADER_PREFIX,
        noJwtError: true,
        globalHeaders: [{ 'Accept': 'application/json' }],
        tokenGetter: (() => storage.get('token')),
    }), http);
}
export function failure(error: any) {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return errMsg;
}
export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}; 
@NgModule({
    declarations: [
        SurgiPalApp,
        AboutPage,
        ContactPage,
        AccountPage,
        SupportPage,
        HomePage, 
        PulsePage, SurgeryDetailPage, CodeDetails, BillingDetails,
        MessageListPage, MessageDetailPage, MessageReplyModal,
        CalendarPage,
        TabsPage ,
        AddSurgeryComponent ,
        LoginPage
    ],
    imports: [AppInsightsModule ,
        BrowserModule, HttpModule, MomentModule,
        IonicModule.forRoot(SurgiPalApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        SurgiPalApp,
        AboutPage,
        ContactPage,
        AccountPage,
        SupportPage,
        HomePage,
        PulsePage, SurgeryDetailPage, CodeDetails, BillingDetails,
        MessageListPage, MessageDetailPage, MessageReplyModal,
        CalendarPage,
        TabsPage ,
        AddSurgeryComponent ,
        LoginPage
    ],
    providers: [
        AuthService,
        {
            provide: AuthHttp,
            useFactory: getAuthHttp,
            deps: [Http]
        },
      { provide: ErrorHandler, useClass: IonicErrorHandler },
      //  { provide: ErrorHandler, useClass: AppInsightsErrorHandler },
            HockeyApp,
        NotifyService,
        SurgeryData,
        MessageData, 
        LoggerService,
        MessageService
        
    ]
})
export class AppModule { }
