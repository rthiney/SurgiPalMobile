import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserEvent } from 'ionic-native';
declare var gapi: any;
interface BrowserEvent extends InAppBrowserEvent {
}


@Component({
  selector: 'app-add-surgery',
  templateUrl: './add-surgery.component.html' 
})
export class AddSurgeryComponent implements OnInit {
  calendarEvent: any = {};
  attendees = [{
    email: ""
  }];
  validation: any = {};

  constructor() { }

  ngOnInit() {
  }
  buildISODate(date, time) {
    var dateArray = date && date.split('-');
    var timeArray = time && time.split(':');
    var normalDate = new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]), parseInt(timeArray[0]), parseInt(timeArray[1]), 0, 0);
    return normalDate.toISOString();
  }
  popLastAttendeeIfEmpty(itemsList) {
    if (!!itemsList.length) {
      return itemsList[0]["email"] == "" ? itemsList.shift(itemsList[0]) : itemsList;
    }
    return [];
  }
  addAttendees() {
    if (this.attendees[this.attendees.length - 1].email == '') return;
    var newAttendee = { email: "" };
    this.attendees.unshift(newAttendee);
  }
  removeAttendees(itemIndex) {
    this.attendees.splice(itemIndex, 1);
  }
  validate() {
    return this.isStringValid(this.calendarEvent.name) &&
      this.isStringValid(this.calendarEvent.name) &&
      this.isStringValid(this.calendarEvent.location) &&
      this.isStringValid(this.calendarEvent.description) &&
      this.isStringValid(this.calendarEvent.startDate) &&
      this.isStringValid(this.calendarEvent.startTime) &&
      this.isStringValid(this.calendarEvent.endDate) &&
      this.isStringValid(this.calendarEvent.endTime) &&
      this.areAttendeesValid(this.attendees);
  }
  isStringValid(str) {
    if (typeof str != 'undefined' && str) {
      return true;
    };
    return false;
  }
  areAttendeesValid(attendees) {
    if (attendees.length == 1 && !this.isStringValid(attendees[0]["email"])) {
      return false;
    }
    return true;
  }

}