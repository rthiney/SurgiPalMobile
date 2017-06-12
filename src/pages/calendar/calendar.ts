
import { Component, ViewChild, ElementRef } from '@angular/core';
import { AlertController, NavController, Platform, App, ModalController, Events } from 'ionic-angular';
import { AuthService, LoggerService, NotifyService } from "../../shared/index";
import { SurgeryData } from "../pulse/index";
import { AuthHttp } from 'angular2-jwt';
import { SurgeryGroupItem } from "../../models/metrics";

@Component({
  selector: 'page-calendar',
  templateUrl: './calendar.html'
})
export class CalendarPage { 
  calendarOptions: Object = {
    height: 'parent',
    contentHeight: 'auto',
    fixedWeekCount: false,
    defaultDate: '2016-09-12',
    editable: true,
    eventLimit: true, // allow "more" link when too many events
    defaultView: 'agendaWeek',
    allDaySlot: false,
    minTime: '06:00:00',
    maxTime: '23:00:00',
    header: {
      left: '',
      center: 'prev, title, next',
      right: ''
    }, events: [
      {
        title: 'All Day Event',
        start: '2016-09-01'
      },
      {
        title: 'Long Event',
        start: '2016-09-07',
        end: '2016-09-10'
      }
    ]
  };

  futureSurgeries: SurgeryGroupItem[];
  eventSource;
  viewTitle;
  isToday: boolean;
  calendar = {
    mode: 'month',
    currentDate: new Date()
  }; // these are the variable used by the calendar.
  constructor(private authHttp: AuthHttp,
    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public auth: AuthService,
    private surgeryData: SurgeryData,
    public note: NotifyService,
    public log: LoggerService,
    public events: Events) {

    //this.futureSurgeries = surgeryData.data.futureSurgeries;

  }
  loadEvents() {
    this.eventSource = this.createRandomEvents();
  }
  loadSurgeries() {
    this.eventSource = this.createEventsFromSurgeries();
  }
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
  onEventSelected(event) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }
  changeMode(mode) {
    this.calendar.mode = mode;
  }
  today() {
    this.calendar.currentDate = new Date();
  }
  onTimeSelected(ev) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }
  onCurrentDateChanged(event: Date) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    event.setHours(0, 0, 0, 0);
    this.isToday = today.getTime() === event.getTime();
  }
  createRandomEvents() {
    var events = [];
    for (var i = 0; i < 50; i += 1) {
      var date = new Date();
      var eventType = Math.floor(Math.random() * 2);
      var startDay = Math.floor(Math.random() * 90) - 45;
      var endDay = Math.floor(Math.random() * 2) + startDay;
      var startTime;
      var endTime;
      if (eventType === 0) {
        startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + startDay));
        if (endDay === startDay) {
          endDay += 1;
        }
        endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + endDay));
        events.push({
          title: 'All Day - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: true
        });
      } else {
        var startMinute = Math.floor(Math.random() * 24 * 60);
        var endMinute = Math.floor(Math.random() * 180) + startMinute;
        startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + startDay, 0, date.getMinutes() + startMinute);
        endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate() + endDay, 0, date.getMinutes() + endMinute);
        events.push({
          title: 'Event - ' + i,
          startTime: startTime,
          endTime: endTime,
          allDay: false
        });
      }
    }
    return events;
  }

  createEventsFromSurgeries() {
    var events2 = [];

    this.futureSurgeries.forEach(s => {

      var date = new Date(s.surgery.term);
      var duration = parseInt(s.surgery.surgeryTime) * 60;

      var startMinute = parseInt(s.surgery.surgeryTime); //Math.floor(Math.random() * 24 * 60);
      var endMinute = duration + startMinute;
      var startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, date.getMinutes());
      var endTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, date.getMinutes() + duration);
       events2.push({
        title: s.surgery.initials + ' - ' + s.surgery.patient,
        start: startTime,
        end: endTime
      });
    });

    return events2;
  }
  onRangeChanged(ev) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }
  markDisabled = (date: Date) => {
    var current = new Date();
    current.setHours(0, 0, 0);
    return date < current;
  };


}