import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from, BehaviorSubject } from 'rxjs';
import { User } from '../Models/user';
import { AuthenticationService } from './authentication.service';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../Models/chatMessage';
import { UserService } from './user.service';



@Injectable({
  providedIn: 'root'
})
export class GameService implements OnDestroy {
  private hubConnection: HubConnection;
  private userSubscription:Subscription;
  private contactsSubscription:Subscription;
  
  currentUser: User;
  friends: string[] = [];
  
  private _messages = new BehaviorSubject<ChatMessage[]>([]);
  private messageStore: { messages: ChatMessage[] } = { messages: [] }; // store our data in memory
  messages = this._messages.asObservable();

  private _isConnected = new BehaviorSubject<boolean>(false);
  isConnected = this._isConnected.asObservable();

  private _onlineFriends = new BehaviorSubject<string[]>([]);
  private onlineFriendStore: { friends: string[] } = { friends: [] }; // store our data in memory
  onlineFriends = this. _onlineFriends.asObservable();

  
  constructor(private authenticationService: AuthenticationService, private userService:UserService) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/game`, { accessTokenFactory: () => this.currentUser.token })
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


  public sendMessage(message: string): void {

    this.hubConnection
      .invoke('sendToAll', this.currentUser.username, message)
      .catch(err => console.error(err));
  }

  private getOnlineContacts(): void {    
    var promise =  this.hubConnection.invoke('GetOnlineContacts',this.currentUser.username)
      .then(result => {          
          this.onlineFriendStore.friends = result;
          this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
        })
        .catch(err =>  {          
          this.onlineFriendStore.friends = [];
          this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
      });
  }

  private connect():void{

    this.contactsSubscription = this.userService.getContacts()
        .subscribe(c => this.friends = c);    

    this.hubConnection
      .start()
      .then(() => {
        this._isConnected.next(true);
        this.getOnlineContacts();
      })
      .catch(err =>{ 
        this._isConnected.next(false);
        console.log('Error while establishing connection :(');
      });

    this.hubConnection.on('sendToAll', (name: string, message: string) => {
      var newMsg = new ChatMessage();
      newMsg.date = Date.now().toString();
      newMsg.sender = name;
      newMsg.text = message;

      this.messageStore.messages.push(newMsg);
      this._messages.next(Object.assign({}, this.messageStore).messages);
    });

    this.hubConnection.on('connected', (name: string) => {
      this.addOnlineFriend(name);
    });
    this.hubConnection.on('disconnected', (name: string) => {
      this.removeOnlineFriend(name);
    });


  }
  private disconnect():void{
    if(!!this.contactsSubscription){
      this.contactsSubscription.unsubscribe();}
    
    console.log('Disconnecting from WebSockets...');    
    this.hubConnection.off("start");
    this.hubConnection.off("catch");
    this.hubConnection.stop();
  }

  private addOnlineFriend(name:string ):void{
    if (this.friends.includes(name))
    {
      this.onlineFriendStore.friends.push(name);
      this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }
  }
  private removeOnlineFriend(name:string ):void{
    const index: number = this.onlineFriendStore.friends.indexOf(name);
    if (index !== -1) {
        this.onlineFriendStore.friends.splice(index, 1);
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }
  }

  
}
