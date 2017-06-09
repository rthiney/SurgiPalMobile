import { UserData } from './../models/viewmodels/index'
import { Events } from 'ionic-angular';
import { Http } from '@angular/http';
import { Auth0Vars, CONFIGURATION, AzureMobile } from './app.constants';
import { Storage } from '@ionic/storage';
import { AuthHttp, JwtHelper, tokenNotExpired } from 'angular2-jwt';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { LoggerService } from'./index';
//import * as WindowsAzure from 'azure-mobile-apps-client';
// Avoid name not found warnings
import azureMobileClient from 'azure-mobile-apps-client';
declare var WindowsAzure: any;
declare var Auth0: any;
declare var Auth0Lock: any;
@Injectable()
export class AuthService {
    updated_at: any;
    created_at: any;
    name: string;
    last: any;
    first: any;
    email: any;
    image: any;
    picture: any;

    jwtHelper: JwtHelper = new JwtHelper();
    auth0 = new Auth0({ clientID: Auth0Vars.AUTH0_CLIENT_ID, domain: Auth0Vars.AUTH0_DOMAIN });
    lock = new Auth0Lock(Auth0Vars.AUTH0_CLIENT_ID, Auth0Vars.AUTH0_DOMAIN, {
        //https://github.com/auth0/lock#theming-options  // Username-Password-Authentication
        languageDictionary: {
            title: 'Welcome!'
        },
        allowSignUp: true,
        signUpLink: CONFIGURATION.baseUrls.server + 'register/',
        rememberLastLogin: true,
        socialButtonStyle: 'small',
        allowedConnections: ['MySqlAzure', 'Username-Password-Authentication', 'facebook', 'google-oauth2'],
        theme: {
            primaryColor: '#90a4ae',
          //  logo: 'http://surgipal.azurewebsites.net/assets/img/SurgiPalLogoName.png'
           // logo: '/assets/img/logo.png'
            logo:'https://surgipal.com/bundles/doctorswebsite/images/logo.png'
        },
        auth: {
            responseType: 'token',
            redirect: false,
            params: {
                scope: 'openid offline_access roles permissions email picture',
            },
            sso: false
        }
    });

    refreshToken: any;
    storage: Storage = new Storage();
    refreshSubscription: any;
    user: any;
    globalId: any;
    fosId: number;
    doctorId: number;
    roles: string[] = [];
    permissions: string[] = [];
    zoneImpl: NgZone;
    idToken: string;
    latitude: string;
    longitude: string;
    _favorites: string[] = [];
    HAS_LOGGED_IN = 'hasLoggedIn';
    HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
    client: any;
    table: any;
    //   client: WindowsAzure.MobileServiceClient;
    constructor(private authHttp: AuthHttp, zone: NgZone, public http: Http, public events: Events) {


        this.zoneImpl = zone;
        // Check if there is a profile saved in local storage
        this.storage.get('profile').then(profile => {
            if (profile) {
                this.dumpProfileVariables(JSON.parse(profile));
                this.storage.get('id_token').then(token => {
                    this.idToken = token;
                });
                this.events.publish('user:loginstorage', this.name);
            }
        }).catch(error => {
            console.error("No profile in storage.");
        });





        this.lock.on('authenticated', authResult => {
            console.log('authResult', authResult);
            this.storage.set('id_token', authResult.idToken);
            this.storage.set('refresh_token', authResult.refreshToken);
            this.idToken = authResult.idToken;
            // Fetch profile information
            this.lock.getProfile(authResult.idToken, (error, profile) => {
                if (error) {
                    // Handle error
                    console.error('getProfile', error);
                    return;
                }
                console.log('getProfile', profile);

                this.dumpProfileVariables(profile);


                //save to tables
                this.saveToMobileClientTable();

                // Schedule a token refresh

            });

            this.lock.hide();

            this.zoneImpl.run(() => this.user = authResult.profile);
            this.events.publish('user:login', this.name)

            this.scheduleRefresh();

        });
    }

    dumpProfileVariables(profile: any) {
        this.storage.set('profile', JSON.stringify(profile));
        this.user = profile;

        this.picture = profile.picture || '';
        this.created_at = profile.created_at;
        this.updated_at = profile.updated_at;
        this.image = profile.image || '';
        this.email = profile.email || '';
        this.first = profile.first || '';
        this.last = profile.last || '';
        this.name = profile.first + ' ' + profile.last;
        this.storage.set('username', this.name);
        this.fosId = profile.fos_id || '';
        this.globalId = profile.global_client_id || '';
        this.roles = profile.app_metadata.authorization.roles;
        this.permissions = profile.app_metadata.authorization.permissions;
         this.latitude = profile.user_metadata.geoip.latitude || '';
        this.longitude = profile.user_metadata.geoip.longitude || '';
        console.log('Dumped user data to Auth');

    }
    saveToMobileClientTable() {
        console.log('Dumped user data to Auth');
        this.client = new azureMobileClient.MobileServiceClient(AzureMobile.url);
        this.table = this.client.getTable('UserData');

        this.table
            .where({ userId: this.globalId })
            .read()
            .then(this.exists, this.failure);

    }
    exists(results) {
        console.log('User Exists in Azure Table', results);

        if (results[0] = undefined) return;
        var newItem = new UserData(this.name, this.picture, this.email, this.picture, this.globalId, false, this.fosId);

        this.table
            .insert(newItem)
            .done(function (insertedItem) {
                console.log('savedToMobileClientTable');
                var id = insertedItem.id;
            }, this.failure);

    }

    public getRefreshToken() {
        return new Promise((resolve) => {
            console.log('getting a new on startup Jwt');
            this.storage.get('refresh_token').then(refresh_token => {
                this.refreshToken = refresh_token;
                console.log('found refresh_token', refresh_token)
                resolve(refresh_token);
            })
        })
    }

    // called on first load from app.component.ts
    public refreshJwt(refresh_token) {
        console.log('Calling refreshJwt');
   this.storage.get('profile').then(profile => {
            if (profile) {
                       console.log("refreshJwt profile from storage.",profile);
                this.dumpProfileVariables(JSON.parse(profile)); 
            }
        }).catch(error => {
            console.error("No profile in storage.");
        });


        return new Promise((resolve) => {
            if (!refresh_token) {
                console.log('    resolve(false);');
                resolve(false);
            } else {
                console.log('       this.auth0.refreshToken(');
                this.auth0.refreshToken(refresh_token, (err, delegationRequest) => {
                    if (err) {
                        // alert(err);
                        console.log('  err    refreshToken delegationRequest');
                    }
                    console.log('got new Jwt, set token');
                    try {
                        this.storage.set('id_token', delegationRequest.id_token);
                        this.idToken = delegationRequest.id_token;

                        var authenticated: boolean = this.authenticated();
                        // returns a promise<boolean> that finally
                        // determines if user is truly authenticated
                        resolve(authenticated);
                    }
                    catch (e) {
                    }
                });
            }
        })

    }

    public authenticated() {
        //  console.log('checking authenticated from:', source, tokenNotExpired('id_token', this.idToken))
        return tokenNotExpired('id_token', this.idToken);
    }
    public login() {
        // Show the Auth0 Lock widget
        this.lock.show();
    }

    public logout() {



        this.storage.remove('profile');
        this.storage.remove('id_token');
        this.storage.remove('refresh_token');
        this.storage.remove('username');

        this.events.publish('user:logout');
        this.idToken = null;
        this.zoneImpl.run(() => this.user = null);
        // Unschedule the token refresh
        this.unscheduleRefresh();
       // this.lock.show();
    }


    public scheduleRefresh() {
        // If the user is authenticated, use the token stream
        // provided by angular2-jwt and flatMap the token
        console.log('schedule a refresh');
        let source = Observable.of(this.idToken).flatMap(
            token => {
                // The delay to generate in this case is the difference
                // between the expiry time and the issued at time
                let jwtIat = this.jwtHelper.decodeToken(token).iat;
                let jwtExp = this.jwtHelper.decodeToken(token).exp;
                let iat = new Date(0);
                let exp = new Date(0);

                let delay = (exp.setUTCSeconds(jwtExp) - iat.setUTCSeconds(jwtIat));

                console.log('set delay to ' + delay);
                return Observable.interval(delay);
            });

        this.refreshSubscription = source.subscribe(() => {
            console.log('refresh subscription, getNewJwt');
            this.getNewJwt();
        });
    }
    public startupTokenRefresh() {
        console.log('startup token refresh');
        // If the user is authenticated, use the token stream
        // provided by angular2-jwt and flatMap the token
        if (this.authenticated()) {
            console.log('user is authenticated on startup');
            this.storage.get('refresh_token').then(refresh_token => {
                this.refreshToken = refresh_token;
                // get auth cookie from rivals
                // this.authWithRivals();
            }).catch(error => {
                console.log(error);
            });
            let source = Observable.of(this.idToken).flatMap(
                token => {
                    // Get the expiry time to generate
                    // a delay in milliseconds
                    let now: number = new Date().valueOf();
                    let jwtExp: number = this.jwtHelper.decodeToken(token).exp;
                    let exp: Date = new Date(0);
                    exp.setUTCSeconds(jwtExp);
                    let delay: number = exp.valueOf() - now;
                    // let delay = 10000;

                    console.log('set delay to ' + delay);
                    // Use the delay in a timer to
                    // run the refresh at the proper time
                    return Observable.timer(delay);
                });

            // Once the delay time from above is
            // reached, get a new JWT and schedule
            // additional refreshes
            source.subscribe(() => {
                console.log('get a new token and schedule a refresh');
                this.getNewJwt();
                // this.navCtrl.push(TabsPage);
                this.scheduleRefresh();
            });
        }
    }
    public unscheduleRefresh() {
        // Unsubscribe fromt the refresh
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    public getNewJwt() {
        // Get a new JWT from Auth0 using the refresh token saved
        // in local storage
        console.log('getting a new Jwt');
        this.storage.get('refresh_token').then(token => {
            this.auth0.refreshToken(token, (err, delegationRequest) => {
                if (err) {
                    console.log(err);
                }
                console.log('got new Jwt, set token');
                this.storage.set('id_token', delegationRequest.id_token);
                this.idToken = delegationRequest.id_token;
                // return promise?  to be used by app.component?

                //    this.lock.getProfile(this.idToken, (error, profile) => {
                //   if (error) {
                //     // Handle error
                //     console.error('getProfile Refresh', error);
                //     return;
                //   }
                //   console.log('getProfile Refresh', profile);

                //   this.dumpProfileVariables(profile);



                // });
            });
        })
            .catch(error => {
                console.log(error);
            });

    }


    hasFavorite(sessionName: string): boolean {
        return (this._favorites.indexOf(sessionName) > -1);
    };

    addFavorite(sessionName: string): void {
        this._favorites.push(sessionName);
    };

    removeFavorite(sessionName: string): void {
        let index = this._favorites.indexOf(sessionName);
        if (index > -1) {
            this._favorites.splice(index, 1);
        }
    };



    setUsername(username: string): void {
        this.storage.set('username', username);
    };

    getUsername(): Promise<string> {
        return this.storage.get('username').then((value) => {
            return value;
        });
    };

    hasLoggedIn(): Promise<boolean> {
        return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
            return value === true;
        });
    };

    checkHasSeenTutorial(): Promise<string> {
        return this.storage.get(this.HAS_SEEN_TUTORIAL).then((value) => {
            return value;
        });
    };

    public isAdmin() {

        return this.roles.indexOf('admin') > -1;
    }
    public isVendor() {
        return this.roles.indexOf('vendor') > -1;
    }
    public isHospital() {
        return this.roles.indexOf('hospital') > -1;
    }
    public isDoctor() {
        return this.roles.indexOf('physician') > -1;

    }

    public success(results: any) {
        var numItemsRead = results.length;

        for (var i = 0; i < results.length; i++) {
            var row = results[i];
            // Each row is an object - the properties are the columns
        }
    }

    public failure(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error('handleError in Pulse Servicess', errMsg); // log to console instead
        return errMsg;
    }
}
