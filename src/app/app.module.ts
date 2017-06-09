import { MessageService } from './../pages/message/message.service';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from "@angular/platform-browser";
import { Http, HttpModule } from "@angular/http";
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { AuthConfig, AuthHttp } from 'angular2-jwt';
import { MomentModule } from 'angular2-moment';
import { StatusBar, Splashscreen } from 'ionic-native';
import { Storage } from '@ionic/storage';
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


 

let storage = new Storage();

export function getAuthHttp(http) {
    return new AuthHttp(new AuthConfig({
       // headerPrefix: YOUR_HEADER_PREFIX,
        noJwtError: true,
        globalHeaders: [{ 'Accept': 'application/json' }],
        tokenGetter: (() => storage.get('token')),
    }), http);
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

//export function getAuthHttp(http) {
//    console.log('getAuthHttp');
//    return new AuthHttp(new AuthConfig({
//        globalHeaders: [{ 'Accept': 'application/json' }],
//        tokenGetter: (() => window.localStorage.getItem('id_token'))
//    }), http);
//}

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
        TabsPage
    ],
    imports: [
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
        TabsPage
    ],
    providers: [
        AuthService,
        {
            provide: AuthHttp,
            useFactory: getAuthHttp,
            deps: [Http]
        },
        { provide: ErrorHandler, useClass: IonicErrorHandler },
            HockeyApp,
        NotifyService,
        SurgeryData,
        MessageData,
        LoggerService,MessageService
        

    ]
})
export class AppModule { }
