 
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController  } from 'ionic-angular';
 
import { TabsPage } from '../tabs/tabs';
import { AuthService } from "../../shared/index";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: {username?: string, password?: string} = {};
 
  constructor(public navCtrl: NavController, private auth : AuthService) { }

  onLogin( ) {
    this.auth.login();
   // this.auth.lock.show();
    // if (form.valid) {
    //   this.auth.login(this.login.username);
    //   this.navCtrl.push(TabsPage);
    // }
  }

  onSignup() {
     this.auth.logout();
   //this.navCtrl.push(SignupPage);
  }
}
