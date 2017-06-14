import { MessageMetrics, MessageGroupItem, MessageGroup } from './../../models/metrics';
import { Events } from 'ionic-angular';
import { DoctorMessageModel } from './../../models/viewmodels/doctor_message_model';
import { AuthHttp } from 'angular2-jwt';
import { Injectable } from '@angular/core';

import { Http } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import { AuthService, CONFIGURATION } from "../../shared/index";

@Injectable()
export class MessageData {
    messages: MessageGroupItem[] = [];
    data: DoctorMessageModel[];
    metrics: MessageMetrics = new MessageMetrics();
    groupedMessages = [];
    readMessages: MessageGroupItem[] = [];
    unreadMessages: MessageGroupItem[] = [];
    constructor(public authHttp: AuthHttp, public auth: AuthService, public events: Events) { }

    load(): any {
        if (this.data) {
            console.log("NOT LOADING FROM SERVER DATA = ", this.data);
            return Observable.of(this.data);
        } else {
            // var url=CONFIGURATION.baseUrls.apiUrl +'surgeries/past/' + this.auth.fosId;
            // return this.http.get('assets/data/data.json')
            //   .map(this.processData, this);
            console.log("LOADING FROM SERVER");
            var url = CONFIGURATION.baseUrls.apiUrl + 'messages/doctors/' + this.auth.fosId;
            console.log('URL:', url);
            return this.authHttp.get(url)
                .map(this.processData, this)
        }
    }
    saveData() {
        console.group('Saving Message Data');
        try {
            this.auth.storage.set('messagesStoreDate', new Date().toJSON());
            this.auth.storage.set('messages', this.data);
        }
        catch (e) {
            console.error(e);
        }
        console.groupEnd();
    }
   
    processData(data: any) {
        console.group('Processs Message Data');
        // just some good 'ol JS fun with objects and arrays
        // build up the data by linking speakers to sessions
        this.data = data.json();
        this.saveData()
        let currentDate = '';
        let currentMessages = [];
        this.groupedMessages = [];
        // loop through each message
        this.data.forEach((message: DoctorMessageModel) => {

            message.DoctorImage = this.auth.getPicture();  //  (message.DoctorImage == null) ? 'assets/img/flat.png' : 'https://surgipal.com/uploads/avatars/' + message.DoctorImage; 

            let d = new Date(message.createdAt);

            if (d.toLocaleDateString() != currentDate) {

                currentDate = d.toLocaleDateString();

                let newGroup = new MessageGroup(d);

                currentMessages = newGroup.messages;
                this.groupedMessages.push(newGroup);
            }
            let newMessage = new MessageGroupItem(message);
            this.messages.push(newMessage);
            currentMessages.push(newMessage);
            //    console.log('Complete or not:');
            if (message.viewed !== null && message.viewed) {
                this.metrics.read++;
                this.readMessages.push(newMessage);
            }
            else {
                this.metrics.unread++;
                this.unreadMessages.push(newMessage);
            }

            //get rid of empty future groups. 

            ///this.events.publish('message:metrics',     this.metrics  ); 

        });
        console.groupEnd(); console.groupCollapsed('Processs Message Data')
        this.reduceGroup();
        return this.data;
    }
    reduceGroup() {
        console.group('Reduce Message Group');
        console.log('Old message group count', this.groupedMessages.length);
        let newGroups: MessageGroup[] = [];
        this.groupedMessages.forEach((group: MessageGroup) => {

            if (group.messages.length > 0)
                newGroups.push(group);
        });
        this.groupedMessages = newGroups;
        console.log('New group count', this.groupedMessages.length);
        console.groupEnd(); console.groupCollapsed('Reduce Message Group');
    }
    getTime(date?: Date) {
        return date != null ? date.getTime() : 0;
    }

    sortByDueDate(): void {
        this.data.sort((a: DoctorMessageModel, b: DoctorMessageModel) => {
            return a.createdAt.getDate() - b.createdAt.getDate();
        });
    }

    getMetrics() {
        return this.load().map((data: any) => {
            let m = this.metrics;
            this.events.publish('message:metrics', m);
            return m
        })
    }

    getMessages(queryText = '', segment = 'unread', refresh = false) {
        if (refresh) {
            this.data = null;
        }
        
        // console.log('getMessages:query:', queryText);
        // console.log('getMessages:segment:', segment);
        return this.load().map((data: any) => {
            console.group('getMessages()');
            console.log('refresh', refresh);
            let day = this.messages;
            this.metrics.unread = this.unreadMessages.length;
            this.metrics.read = this.readMessages.length;
            //console.log('day', day);
            queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
            let queryWords = queryText.split(' ').filter(w => !!w.trim().length);
            //console.log('queryWords', queryWords);
            //debugger;
            // day.forEach((dt: any) => {
            //     dt.hide = true;
            //     dt.messages.forEach((msgs: any) => {
            //         msgs.message.hide = true;
            //         ///    if (msgs.message.viewed)   day.readCount++; else    day.unreadCount++;
            //         // check if this session should show or not 
            //         if (!msgs.message.hide)
            //             /// day.shownMessages++;

            //             if (!msgs.message.hide && dt.hide) {
            //                 // if this session is not hidden then this group should show
            //                 console.log('Group ' + dt.d + ' changes to show because of message.', msgs.message);
            //                 dt.hide = false;
            //             }
            //     });

            // });
            console.groupEnd();
            return day;

        });
    }
    failure(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return errMsg;
    }
    filterMessages(srg: any, queryWords: string[], segment: string) {
        let matchesQueryText = false;
        if (queryWords.length) {
            // of any query word is in the session name than it passes the query test
            queryWords.forEach((queryWord: string) => {
                try {
                    if (srg.message.subject && srg.message.subject.toLowerCase().indexOf(queryWord) > -1) {
                        matchesQueryText = true;
                    }
                    else if (srg.message.message && srg.message.message.toLowerCase().indexOf(queryWord) > -1) {
                        matchesQueryText = true;
                    } else if (srg.message.DoctorName && srg.message.DoctorName.toLowerCase().indexOf(queryWord) > -1) {
                        matchesQueryText = true;

                    } else if (srg.message.HospitalName && srg.message.HospitalName.toLowerCase().indexOf(queryWord) > -1) {
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

        // if the segement is 'favorites', but session is not a user favorite
        // then this session does not pass the segment test
        let matchesSegment = false;
        if (segment === 'all')
            matchesSegment = true;
        else if (!srg.message.viewed && segment === 'unread')
            matchesSegment = true;
        else if (srg.message.viewed && segment === 'read')
            matchesSegment = true;

        srg.message.hide = !(matchesQueryText && matchesSegment);
    }

    //https://scotch.io/tutorials/angular-2-http-requests-with-observables    <<READ THIS

    // updateMessage (body: Object): Observable<Comment[]> {
    // let bodyString = JSON.stringify(body); // Stringify payload
    // let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    // let options       = new RequestOptions({ headers: headers }); // Create a request option

    // return this.http.put(`${this.commentsUrl}/${body['id']}`, body, options) // ...using put request
    //                  .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
    //                  .catch((error:any) => Observable.throw(error.json().error || 'Server error')); //...errors if any
    // }

    // ngOnChanges() {
    //         // Listen to the 'edit'emitted event so as populate the model
    //         // with the event payload
    //         EmitterService.get(this.data).subscribe((comment:Comment) => {
    //             this.model = comment
    //             this.editing = true;
    //         });
    //     }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        // We'd also dig deeper into the error to get a better message
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error('handleError in Message', MessageData); // log to console instead
        return errMsg;
    }
}
