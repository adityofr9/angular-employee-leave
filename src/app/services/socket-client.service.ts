import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AuthService } from '../api/auth/auth.service';
// var sockjs = require('sockjs');

// import * as Stomp from 'stompjs';
var stompjs = require('stompjs');

// import * as SockJS from 'sockjs-client';
var sockjs = require('sockjs-client');

@Injectable({
  providedIn: 'root',
})
export class SocketClientService {
  socketClient: any = null;
  url = 'https://api-miebca2024.unictive.net/ws';

  subs!: Subscription;
  subs2!: Subscription;

  public notif_chat = new BehaviorSubject<any>(null);
  notif_chat$ = this.notif_chat.asObservable();

  subsLogout!: Subscription;
  subs2Logout!: Subscription;

  public notif_logout = new BehaviorSubject<any>(null);
  notif_logout$ = this.notif_logout.asObservable();

  idActive: any;

  isConnecting: boolean = false; // Status untuk mencegah pemanggilan berulang

  constructor(
    private auth: AuthService,
  ) {}

  private configureSocketClient(client: any) {
    client.debug = null;

    client.heartbeat.outgoing = 2000;

    // client.heartbeat.incoming = 0;

    client.reconnect_delay = 5000;

    return client;
  }

  private initSocket() {
    if (this.socketClient) {
      return;
    }

    console.log('Initialize WebSocket Connection');

    let ws = new sockjs(this.url);

    this.socketClient = stompjs.over(ws);
    this.socketClient = this.configureSocketClient(this.socketClient);
  }

  async openConnection(eventId?: any, scheduleId?: any) {
    return new Promise<void>((resolve, reject) => {
      if (this.socketClient && this.socketClient.connected) {
        // console.log("STOMP already connected.");
        this.runListenerLO();
        if (!!eventId && !!scheduleId) {
          this.runListenMessage2(eventId, scheduleId);
        }
        resolve();
        return
      }

      if (this.isConnecting) {
        console.log("Already attempting to connect...");
        return;
      }

      this.isConnecting = true;
      this.initSocket();
      this.socketClient.connect(
        {},
        (frame: any) => {
          console.log("STOMP connection established.");
          this.isConnecting = false;

          this.runListenerLO();
          if (!!eventId && !!scheduleId) {
            this.runListenMessage2(eventId, scheduleId);
          }
          resolve();
        },

        (error: any) => {
          console.error("STOMP connection error:", error);
          this.isConnecting = false;
          reject(error);
        }
      );
    });
  }

  sendMessage(message: any) {
    this.socketClient.send(
      '/app/chat',
      {},
      JSON.stringify({
        fromUser: 'abc',
        toUser: 'efg',
        message: message,
      })
    );
  }

  showMessage(msg: any) {
    // this.messageService.add({
    //   key: 'confirm',
    //   sticky: true,
    //   severity: 'success',
    //   data: msg,
    // });
  }

  disconnent() {
    this.socketClient.disconnect();
  }


  // MARK: Live Question
  runListenMessage2(eventId: any, scheduleId: any) {
    if (!!this.subs2) {
      this.subs2?.unsubscribe();
    }
    this.subs2 = this.listenMessages2(eventId, scheduleId).subscribe((message: any) => {
      this.notif_chat.next(message);
    });
  }

  listenMessages2(eventId: any, scheduleId: any): Observable<any> {
    return new Observable((subscribe) => {
      if (!this.socketClient || !this.socketClient.connected) {
        console.error("WebSocket is not connected yet!");
        return;
      }

      // if (!!this.subs) {
      //   this.subs?.unsubscribe();
      // }
      var channel = "/events/" + eventId + "/schedule/" + scheduleId;
      this.subs = this.socketClient.subscribe(channel, (message: any) => {
        // console.log('message', message);
        subscribe.next(message);
      });
    });
  }

  // MARK: Logout Sessions (Multi Login)
  async runListenerLO() {
    if (this.auth.users && this.auth.users.id) {
      if (!this.socketClient || !this.socketClient.connected) {
        await this.openConnection();
      }
      this.runListenMessageLO(this.auth.users.id);
    }
  }

  runListenMessageLO(usersId: any) {
    if (!!this.subsLogout) {
      this.subsLogout?.unsubscribe();
    }
    this.subsLogout = this.listenMessagesLO( usersId).subscribe((message: any) => {
      this.notif_logout.next(message);
    });
  }

  listenMessagesLO(usersId: any): Observable<any> {
    return new Observable((subscribe) => {
      if (!this.socketClient || !this.socketClient.connected) {
        console.error("WebSocket is not connected yet!");
        return;
      }
      // if (!!this.subs2Logout) {
      //   this.subs2Logout?.unsubscribe();
      // }

      var channel = "/users/" + usersId + "/force-logout";
      this.subs2Logout = this.socketClient.subscribe(channel, (message: any) => {
        subscribe.next(message);
      });
    });
  }
}
