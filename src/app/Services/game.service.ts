import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from } from 'rxjs';
import { User } from '../Models/user';
import { AuthenticationService } from './authentication.service';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { emit } from 'cluster';

@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private hubConnection: HubConnection;
  private userSubscription:Subscription;
  currentUser: User;
  messages: string[] = [];
  
  constructor(private authenticationService: AuthenticationService) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/chat`, { accessTokenFactory: () => this.currentUser.token })
      .build();
    this.userSubscription = this.authenticationService.currentUser.subscribe(x =>{
      this.currentUser = x;
      console.log('User :', this.currentUser?.username);
      if (!this.currentUser?.username)
      {
        this.disconnect();
      }
      else      
      {
        this.connect();
      }
    });
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
  
  public get Messages() : string[] {
    return this.messages;
  }

  public sendMessage(message: string): void {

    this.hubConnection
      .invoke('sendToAll', this.currentUser.username, message)
      .catch(err => console.error(err));
  }
  

  private connect():void{                
    console.log('Connecting to WebSockets...');    
    this.hubConnection
      .start()
      .then(() => console.log('Connected to Server.'))
      .catch(err => console.log('Error while establishing connection :('));

    this.hubConnection.on('sendToAll', (name: string, message: string) => {
      const text = `${name}: ${message}`;
      emit adasdkasld
      this.messages.push(text);
    });
  }

  private disconnect():void{
    console.log('Disconnecting from WebSockets...');    
    this.hubConnection.off("start");
    this.hubConnection.off("catch");
    this.hubConnection.stop();
  }
}
