import { Events } from 'ionic-angular';
import { SurgeryMetrics } from './../../models/metrics';
import { PulseViewModel } from './../../models/viewmodels/index';

import { AuthHttp } from 'angular2-jwt';

import { Injectable } from '@angular/core';

import { Http } from '@angular/http';


import { Observable } from 'rxjs/Observable';

import { AuthService, CONFIGURATION } from "../../shared/index";
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

@Injectable()
export class SurgeryData {
  data: any;
  metrics: SurgeryMetrics = new SurgeryMetrics();
  groupedSurgeries = [];
  constructor(public authHttp: AuthHttp, public auth: AuthService, public events: Events) { }

  load(): any {
    if (this.data) {
      console.log("NOT LOADING FROM SERVER");
      return Observable.of(this.data);
    } else {

      var dateObj = new Date();
      var month = dateObj.getUTCMonth() + 1; //months from 1-12
      var day = dateObj.getUTCDate();
      var year = dateObj.getUTCFullYear();
      //   var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/' + this.auth.fosId;
      var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/' + this.auth.fosId + '/' + month + '/' + day + '/0';

      //  var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/12';
      //   var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/today/12';
      // var url = CONFIGURATION.baseUrls.apiUrl + 'surgeries/all/12/6/1/2017';
      console.log("LOADING FROM SERVER", url);
      return this.authHttp.get(url)
        .map(this.processData, this)
    }
  }

  processData(data: any) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions
    this.data = data.json();

    this.data.surgeriesCompleted = [];
    this.data.surgeriesNotCompleted = [];
    let currentDate = '';
    let today = new Date();
    let currentSurgeries = [];
    // loop through each surgery
    this.data.forEach((surgery: PulseViewModel) => {

      surgery.doctorImage = 'https://surgipal.com/uploads/avatars/' + surgery.doctorImage;
      let d = new Date(surgery.term);
      if (d.toLocaleDateString() === today.toLocaleDateString())
        this.metrics.today++;
      if (d > new Date())
        this.metrics.pending++;

      if (d.toLocaleDateString() != currentDate) {

        currentDate = d.toLocaleDateString();
        ///   this.data.dates.push(currentDate);



        let newGroup = {
          d: currentDate,
          surgeries: [],
          hide: false
        };

        currentSurgeries = newGroup.surgeries;
        this.groupedSurgeries.push(newGroup);
      }

      //handles edge case
      surgery.cpt = surgery.cpt.replace('level,', 'level ');
      surgery.diagnosisCode = surgery.diagnosisCode.replace('level,', 'level ');

      let newSurgery = {
        surgery: surgery,
        cptArray: (surgery.cpt) ? surgery.cpt.split(',').filter(w => !!w.trim()).sort() : null,
        dxArray: (surgery.diagnosisCode) ? surgery.diagnosisCode.split(',').filter(w => !!w.trim()).sort() : null,
        hide: false
      };

      currentSurgeries.push(newSurgery);
      if (surgery.completed !== null && surgery.completed)
        this.data.surgeriesCompleted.push(newSurgery);
      else
        this.data.surgeriesNotCompleted.push(newSurgery);


      if (surgery.preferenceCardName) {
        if (this.metrics.cards.indexOf(surgery.preferenceCardName.trim()) < 0) {
          this.metrics.cards.push(surgery.preferenceCardName.trim());
        }
      }


      if (surgery.speciality) {
        if (this.metrics.speciality.indexOf(surgery.speciality.trim()) < 0) {
          this.metrics.speciality.push(surgery.speciality.trim());
        }
      }


      if (surgery.admissionStatus) {
        if (this.metrics.admissionStatus.indexOf(surgery.admissionStatus.trim()) < 0) {
          this.metrics.admissionStatus.push(surgery.admissionStatus.trim());
        }
      }


      if (surgery.patient) {
        if (this.metrics.surgeryType.indexOf(surgery.patient.trim()) < 0) {
          this.metrics.surgeryType.push(surgery.patient.trim());
        }

      }


      if (surgery.cpt) {
        let qt = surgery.cpt.split(',').filter(w => !!w.trim().length);
        qt.forEach((code: string) => {
          this.metrics.cptCodes.push(code.trim());

        });
      }

      if (surgery.diagnosisCode) {

        let qt = surgery.diagnosisCode.split(',').filter(w => !!w.trim().length);
        qt.forEach((code: string) => {
          // if (this.data.diagnosisCodes.indexOf(code.trim()) < 0) {
          this.metrics.diagnosisCodes.push(code.trim());
          //     }
        });
      }

    });

    this.data.groupedSurgeries = this.groupedSurgeries;
    // this.groupedSurgeries = this.data.groupedSurgeries;

    var uniqueCpt = this.metrics.cptCodes.reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }

      return acc;
    }, {});


    var uniqueDiag = this.metrics.diagnosisCodes.reduce(function (acc, curr) {
      if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }

      return acc;
    }, {});
    this.metrics.uniqueDiag = uniqueDiag;
    this.metrics.uniqueCpt = uniqueCpt
    this.metrics.diagnosisCodes = this.metrics.diagnosisCodes.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
    this.metrics.cptCodes = this.metrics.cptCodes.filter(function (item, i, ar) { return ar.indexOf(item) === i; });
    console.log('Processed Surgery Data!!!!!', this.data)
    //  this.events.publish('surgery:metrics',     this.metrics  ); 

    return this.data;
  }
  getMetrics() {
    return this.load().map((data: any) => {
      let m = this.metrics;
      this.events.publish('surgery:metrics', m);
      return m;
    })
  }
  getSurgeries(queryText = '', excludeTracks: any[] = [], segment = 'not', reset=false, date:Date=null) {

    if (reset) this.data = null;
if (date!=null)
    return this.load().map((data: any) => {

      if (!this.data.groupedSurgeries) return null;

      let day = this.data.groupedSurgeries;
      day.shownSurgeries = 0;
      queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
      let queryWords = queryText.split(' ').filter(w => !!w.trim());

      //debugger;
      day.forEach((dt: any) => {
        dt.hide = true;
        dt.surgeries.forEach((srg: any) => {
          srg.hide = true;
          // check if this session should show or not
          this.filterSession(srg, queryWords, excludeTracks, segment);

          if (!srg.hide) {
            // if this session is not hidden then this group should show
            dt.hide = false;
            day.shownSurgeries++;
          }
        });

      });

      return day;

    });



    // res.forEach((srg: any) => {
    //   srg.hide = true;
    //   console.log('getSurgeries:day:srg', srg)
    //   console.log('getSurgeries:segment', segment)
    //   this.filterSession(srg, queryWords, excludeTracks, segment);
    //   if (!srg.hide) {
    //     // if this session is not hidden then this group should show
    //     srg.hide = false;
    //   }
    // });



    //   day.shownSessions = 0;
    //   queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    //   let queryWords = queryText.split(' ').filter(w => !!w.trim().length);
    //   day.dates.forEach((group: any) => {
    //     group.hide = true;

    //     group.sessions.forEach((session: any) => {
    //       // check if this session should show or not
    //       this.filterSession(session, queryWords, excludeTracks, segment);

    //       if (!session.hide) {
    //         // if this session is not hidden then this group should show
    //         group.hide = false;
    //         day.shownSessions++;
    //       }
    //     });

    //   });

    //   return res;

    // });

  }
  // return this.load().map((data: any) => {
  //   queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
  //   let queryWords = queryText.split(' ').filter(w => !!w.trim().length);
  //   if (queryWords.length) {
  //     // of any query word is in the session name than it passes the query test
  //     queryWords.forEach((queryWord: string) => {
  //       if (surgery.cpt.toLowerCase().indexOf(queryWord) > -1) {
  //         this.shownSurgeries.push(surgery);
  //       } else if (surgery.diagnosisCode.toLowerCase().indexOf(queryWord) > -1) {
  //         this.shownSurgeries.push(surgery);

  //       } else if (surgery.prefereceCardName.toLowerCase().indexOf(queryWord) > -1) {
  //         this.shownSurgeries.push(surgery);

  //       } else if (surgery.patient.toLowerCase().indexOf(queryWord) > -1) {
  //         this.shownSurgeries.push(surgery);
  //       } else if (surgery.initials.toLowerCase().indexOf(queryWord) > -1) {
  //         this.shownSurgeries.push(surgery);
  //       }
  //     });
  // }





  //     let day = data.schedule[dayIndex];
  //     day.shownSessions = 0;

  //     day.groups.forEach((group: any) => {
  //       group.hide = true;

  //       group.sessions.forEach((session: any) => {
  //         // check if this session should show or not
  //         this.filterSession(session, queryWords, excludeTracks, segment);

  //         if (!session.hide) {
  //           // if this session is not hidden then this group should show
  //           group.hide = false;
  //           day.shownSessions++;
  //         }
  //       });

  //     });

  //     return day;
  //   });
  // }

  filterSession(srg: any, queryWords: string[], excludeTracks: any[], segment: string) {

    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach((queryWord: string) => {
        try {
          if (srg.surgery.term && srg.surgery.term.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;
          }
          else if (srg.surgery.patient && srg.surgery.patient.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;
          }
          else if (srg.surgery.cpt && srg.surgery.cpt.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;
          } else if (srg.surgery.diagnosisCode && srg.surgery.diagnosisCode.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;

          } else if (srg.surgery.preferenceCardName && srg.surgery.preferenceCardName.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;

          } else if (srg.surgery.initials && srg.surgery.initials.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;
          }
        }
        catch (e) {
          console.error(e);
        }
      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }
    if (queryWords.length && matchesQueryText)
      console.log('MATCHED', matchesQueryText);





    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    // let matchesTracks = false;
    // srg.tracks.forEach((trackName: string) => {
    //   if (excludeTracks.indexOf(trackName) === -1) {
    //     matchesTracks = true;
    //   }
    // });

    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (!srg.surgery.completed && segment === 'not')
      matchesSegment = true;
    if (srg.surgery.completed && segment === 'completed')
      matchesSegment = true;

    // console.log('Matches matchesQueryText:' + matchesQueryText + ', matches segement' + matchesSegment);
    // all tests must be true if it should not be hidden
    //  console.log('Filter Returns', !(matchesQueryText && matchesSegment));
    srg.hide = !(matchesQueryText && matchesSegment);
  }

  getSpeakers() {
    return this.load().map((data: any) => {
      return data.dates.sort((a: any, b: any) => {
        let aName = a.name.split(' ').pop();
        let bName = b.name.split(' ').pop();
        return aName.localeCompare(bName);
      });
    });
  }

  getPreferenceCards() {
    return this.load().map((data: any) => {
      return data.cards.sort();
    });
  }

  getMap() {
    return this.load().map((data: any) => {
      return data.map;
    });
  }
  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error('handleError in Pulse Servicess', errMsg); // log to console instead
    return errMsg;
  }
}
