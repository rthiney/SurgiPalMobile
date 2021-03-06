import { EmailComposer } from '@ionic-native/email-composer';
import { CallNumber } from '@ionic-native/call-number';
import { LoginPage } from './../pages/login/login';

import { Component, ViewChild } from '@angular/core';

//import { CalendarPage } from './../pages/calendar/calendar.component';
//import { StatsPage } from './../pages/stats/stats';
import { SurgeryMetrics, MessageMetrics } from './../models/metrics';
import { MessageData, MessageListPage } from './../pages/message/index';
import { SurgeryData, PulsePage } from './../pages/pulse/index'; 

import { AzureMobile } from './../shared/app.constants';

import { Events, MenuController, Nav, Platform, App, Menu, NavController } from 'ionic-angular';

import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { TabsPage } from '../pages/tabs/tabs';
import { SupportPage } from '../pages/support/support';
import { AuthService, LoggerService, NotifyService } from "../shared/index";
import { StatusBar, Splashscreen } from 'ionic-native';
import { HockeyApp } from 'ionic-hockeyapp';
import { CalendarPage } from "../pages/calendar/calendar";
import { HomePage } from "../pages/home/home";
import { MessageService } from "../pages/message/message.service";

//declare var WindowsAzure: any;
// ar client = new WindowsAzure.MobileServiceClient(AzureMobile.url);
export interface PageInterface {
    title: string;
    component: any;
    icon: string;
    logsOut?: boolean;
    index?: number;
    tabComponent?: any;
    badgeValue?: number;
    color?: string;
    tabRoot?: string;
}

@Component({
    templateUrl: 'app.html',
    providers: [SurgeryData, MessageService,MessageData,CallNumber,EmailComposer]
})
export class SurgiPalApp {
    isLab: boolean;
    messageMetrics: MessageMetrics;
    surgeryMetrics: SurgeryMetrics;
    hockeyapp: HockeyApp;
    // the root nav is a child of the root app component
    // @ViewChild(Nav) gets a reference to the app's root nav
    @ViewChild(Nav) nav: Nav;

    //  @ViewChild('content') content: NavController;
    //@ViewChild(Menu) menu: Menu;

    // List of pages that can be navigated to from the left menu
    // the left menu only works after login
    // the login page disables the left menu
    appPages: PageInterface[] = [

        { title: 'Today', component: TabsPage, tabComponent: PulsePage, icon: 'pulse', index: 0, badgeValue: 0, color: 'favorite' },
        { title: 'Calendar', component: TabsPage, tabComponent: CalendarPage, index: 1, icon: 'calendar', badgeValue: 0, color: 'favorite' },
        { title: 'Messages', component: TabsPage, tabComponent: MessageListPage, index: 2, icon: 'mail', badgeValue: 0, color: 'favorite' },
        { title: 'Stats', component: TabsPage, tabComponent: AccountPage, icon: 'stats', index: 3, badgeValue: -1, color: 'dark' },
        { title: 'About', component: TabsPage, tabComponent: AboutPage, index: 4, icon: 'information-circle', badgeValue: -1, color: 'dark' }

        // { title: 'Stats', component: TabsPage, tabComponent: StatsPage, index: 2, icon: 'stats' }
    ];
    loggedInPages: PageInterface[] = [
        { title: 'Logout', component: LoginPage, icon: 'log-out', logsOut: true }
    ];
    loggedOutPages: PageInterface[] = [
        { title: 'Login', component: LoginPage, icon: 'log-in' }
    ]

    // loggedInPages: PageInterface[] = [
    //     { title: 'Account', component: AccountPage, icon: 'person' },
    //     { title: 'Support', component: SupportPage, icon: 'help' },
    //     { title: 'About', component: AboutPage, icon: 'information-circle' },
    //     { title: 'Logout', component: AboutPage, icon: 'log-out', logsOut: true }
    // ];
    // loggedOutPages: PageInterface[] = [
    //     // { title: 'Login', component: LoginPage, icon: 'log-in' },
    //     { title: 'About', component: AboutPage, icon: 'help' }
    //     // { title: 'Signup', component: SignupPage, icon: 'person-add' }
    // ];

    rootPage: any;

    constructor(public events: Events,
        public menu: MenuController,
        public platform: Platform,
        public auth: AuthService,
        public log: LoggerService,
        public _note: NotifyService, _hockeyapp: HockeyApp,
        private surgerySvc: SurgeryData, private messageSvc: MessageData) {

        platform.ready().then(() => {

            this.hockeyapp = _hockeyapp;
            this.rootPage = AboutPage;
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
            this.listenToLoginEvents();
            // The Android ID of the app as provided by the HockeyApp portal. Can be null if for iOS only.
            let androidAppId = '67f7ab86a12c4fa1b48e9a4ba5aec358';
            // The iOS ID of the app as provided by the HockeyApp portal. Can be null if for android only.

            // Specifies whether you would like crash reports to be automatically sent to the HockeyApp server when the end user restarts the app.
            let autoSendCrashReports = false;
            // Specifies whether you would like to display the standard dialog when the app is about to crash. This parameter is only relevant on Android.
            let ignoreCrashDialog = true;

            _hockeyapp.start(androidAppId, null, autoSendCrashReports, ignoreCrashDialog);

            //   So app doesn't close when hockey app activities close
            //   This also has a side effect of unable to close the app when on the rootPage and using the back button.
            //   Back button will perform as normal on other pages and pop to the previous page.
            platform.registerBackButtonAction(() => {
                let nav = this.nav; //app.getRootNav();
                if (nav.canGoBack()) {
                    nav.pop();
                } else {
                    if(this.auth.authenticated)
                    nav.setRoot(TabsPage);
                    else
                        nav.setRoot(LoginPage);
                }
            });

            this.auth.getRefreshToken()
                .then((refresh_token) => {
                    console.log('returned refresh_token:', refresh_token);
                    // return false or true for auth status
                    return this.auth.refreshJwt(refresh_token);
                })
                .then((authenticated) => {
                    if (authenticated) {
                        console.log('isAuthenticated: true');
                        // load the conference data  REFACTOR -- INSERT RIVALS QUERY HERE

                        this.rootPage = AboutPage;
                        this.enableMenu(true);
                        this.menu.toggle();
                        this.auth.startupTokenRefresh();
                        // this.auth.authWithRivals();  // now handled in event handler
                        this.events.publish('user:authenticated', 'from getRefreshToken');

                    } else {
                        console.log('isAuthenticated: false');
                        // Should FAIL
                        //  this.auth.authWithRivals(); 
                        this.enableMenu(false);
                        this.rootPage = LoginPage;
                        this.auth.login();
                        // this.auth.checkHasSeenTutorial().then((hasSeenTutorial) =>
                        // {
                        //   this.rootPage = LoginPage;
                        //   this.auth.login();
                        //   // if (hasSeenTutorial === null) {
                        //   //   // User has not seen tutorial
                        //   //   this.rootPage = AboutPage;
                        //   // } else {
                        //   //   this.rootPage = AboutPage;
                        //   // }
                        //   Splashscreen.hide();
                        // });
                    }
                })
                .catch((err) => {

                    console.error('startup auth error:', err);
                })
        });
    }

    feedback() {
        this.hockeyapp.feedback();
    }
    openPage(page: PageInterface) {
        // the nav component was found using @ViewChild(Nav)
        // reset the nav to remove previous pages and only have this page
        // we wouldn't want the back button to show in this scenario
        if (page.index) {
            this.nav.setRoot(page.component, { tabIndex: page.index });
        } else {
            this.nav.setRoot(page.component).catch(() => {
                console.log("Didn't set nav root");
            });
        }

        if (page.logsOut === true) {
            // Give the menu time to close before changing to logged out
            setTimeout(() => {
                this.auth.logout();
            }, 1000);
        }
    }
    loadDataBackground() {
        setTimeout(() => {
            this.getMessageData();
           this.getSurgeryData();
        }, 3000);
    }

    listenToLoginEvents() {
        console.group('Events');
        console.log('LISTENING FOR EVENTS');

        this.events.subscribe('user:authenticated', (n) => {
            this.log.console('EVENT FIRED user:authenticated ' + n, this.auth);
            this.loadDataBackground();
         //   this.nav.setRoot(this.appPages[0].component, { tabIndex: 0 });
         this.nav.setRoot(HomePage);
            this.enableMenu(true);
        });
        this.events.subscribe('user:loginstorage', (n) => {
            this.log.console('EVENT FIRED user:loginstorage');
            this.events.publish('user:authenticated', 'from EVENT user:loginstorage')
        });

        this.events.subscribe('user:login', (n) => {
            this.log.console('EVENT FIRED user:login');
            this.events.publish('user:authenticated', 'from EVENT user:login')
        });

        this.events.subscribe('user:signup', () => {
            this.enableMenu(false);
        });

        this.events.subscribe('user:logout', () => {
            this.enableMenu(false);
        });

        // this.events.subscribe('message:metrics', (metrics) => { 
        //     console.log('MESSAGE METRICS EVENT ', metrics)
        //     this.appPages[2].badgeValue = metrics.unread
        //     this.messageMetrics = metrics;
        //     this.getSurgeryData();
        // });
        // this.events.subscribe('surgery:metrics', (metrics) => {
        //     console.log('SURGERY METRICS EVENT  ', metrics)
        //     this.appPages[0].badgeValue = metrics.today;
        //     this.appPages[1].badgeValue = metrics.pending;
        //     this.surgeryMetrics = metrics;
        // });
        console.groupEnd();
    }
    getMessageData() {
        
        console.log('Getting MessageData Background', this.auth.user);
        this.messageSvc.getMetrics().subscribe((data: any) => {
            this.appPages[2].badgeValue = data.unread;
            console.log('MessageData Background completed');
        },
            err => {
                console.error(err);
               
            },
            () => {
                
            });
     
    }
    getSurgeryData() {
    
        console.log('Getting SurgeryData Background');
        this.surgerySvc.getMetrics().subscribe((data: any) => {
            this.appPages[0].badgeValue = data.today;
            this.appPages[1].badgeValue = data.future;
            console.log('SurgeryData Background completed');
        },
            err => {
                console.log(err);
            },
            () => {
                
            });
   
    }
    enableMenu(loggedIn: boolean) {
        this.menu.enable(loggedIn, 'loggedInMenu');
        this.menu.enable(!loggedIn, 'loggedOutMenu');
    }
    isActive(page: PageInterface) {
        let childNav = this.nav.getActiveChildNav();
        // Tabs are a special case because they have their own navigation
        if (childNav) {
            if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
                return 'secondary';
            }
            return 'primary';
        }

        if (this.nav.getActive() && this.nav.getActive().component === page.component) {
            return 'secondary';
        }
        return 'primary';
    }
}