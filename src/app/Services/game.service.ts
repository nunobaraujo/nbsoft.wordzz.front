import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from, BehaviorSubject } from 'rxjs';
import { User } from '../Models/user';
import { AuthenticationService } from './authentication.service';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { ChatMessage } from '../Models/chatMessage';
import { UserService } from './user.service';
import { stringify } from 'querystring';



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

    if(!!this.contactsSubscription){
      this.contactsSubscription.unsubscribe();}
  } 


  public sendMessage(message: string): void {

    this.hubConnection
      .invoke('sendToAll', this.currentUser.username, message)
      .catch(err => console.error(err));
  }
  public newGame(language:string, friend:string, size:number ):Promise<string>
  {    
    return this.hubConnection
      .invoke('newGame', language, friend ,size)
      .then(res =>{
        let result:string = res;
        return result; 
      })
      .catch(err => {
        console.error(err);
        return "";
      });      
  }
  public newSoloGame():string
  {
    return ""
  }

  private initializeService(): void {    
    this.hubConnection.invoke('GetOnlineContacts')
      .then(result => {          
        console.log('friends :', result);
          this.onlineFriendStore.friends = result;
          this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
          this._isConnected.next(true);
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
        this.initializeService();
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
      console.log('messages :', this.messageStore.messages.length);
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
    this.hubConnection.off("sendToAll");
    this.hubConnection.off("connected");
    this.hubConnection.off("disconnected");
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
