import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';

import { User } from '../Models/user';
import { ChatMessage } from '../Models/chatMessage';
import { GameChallenge } from '../Models/gameChallenge';
import { GameChallengeResult } from '../Models/gameChallengeResult';
import { Game } from '../Models/game';
import { GamePlayer } from '../Models/gamePlayer';
import { map } from 'rxjs/operators';



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

  private _receivedChallenges = new BehaviorSubject<GameChallenge[]>(null);
  private _lastReceivedChallenge = new BehaviorSubject<GameChallenge>(null);
  private receivedChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  receivedChallenges = this._receivedChallenges.asObservable();
  lastReceivedChallenge = this._lastReceivedChallenge.asObservable();

  private _sentChallenges = new BehaviorSubject<GameChallenge[]>(null);  
  private sentChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  sentChallenges = this._sentChallenges.asObservable();

  private _sentChallengesResult = new BehaviorSubject<GameChallengeResult>(null);  
  sentChallengesResult = this._sentChallengesResult.asObservable();
  
  private activeGamesStore: { games: Game[] } = { games: [] }; // store our data in memory
  
  constructor(private router:Router,
    private authenticationService: AuthenticationService, 
    private userService:UserService) {
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
  public async challengeGame(language:string, friend:string, size:number ):Promise<string>
  {    
    try {
      let res = await this.hubConnection
        .invoke('challengeGame', language, friend, size);
      let result: string = res;

      var c = new GameChallenge();
      c.id = result;
      c.challenger = friend;
      c.language = language;
      c.size = size;

      this.sentChallengeStore.challenges.push(c);
      this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
      return result;
    }
    catch (err) {
      console.error(err);
      return "";
    }      
  }
  public newSoloGame():string
  {
    return ""
  }
  public acceptChallenge(challengeId:string , accept: boolean){
    this.hubConnection
      .invoke('challengeAccept', challengeId, accept)
      .then(res =>{
        const index:number = this.receivedChallengeStore.challenges.findIndex(({id})=> id === challengeId);
        if (index!==-1) {
          console.log('Removing Challenge :', index);
          this.receivedChallengeStore.challenges.splice(index, 1);
          this._receivedChallenges.next(Object.assign({},this.receivedChallengeStore).challenges);
        }
        if (accept === true){
          this.router.navigateByUrl("/game-center/challenges")
        }
      })
      .catch(err => console.error(err));
  }

  public getActiveGames():Observable<Game[]>
  {
    if (this._isConnected.value == true){
      var promise = (this.hubConnection.invoke('GetActiveGames').then(games=>{
        console.log('games :', games);
        this.activeGamesStore.games = games;      
        return this.activeGamesStore.games;
      }));    
      return from(promise);
    }
    return null;    
  }
  public getGame(id: string) {
    return this.getActiveGames().pipe(
      map(games => games.find(game => game.id === id))
    );
  }
  public getOpponent(gameId:string):GamePlayer{
    var game = this.activeGamesStore.games.find(x => x.id == gameId);
    if( this.currentUser.username == game.player01.userName){
      return game.player02;
    }
    else{
      return game.player01;
    }
  }
  public getPlayer(gameId:string):GamePlayer{
    var game = this.activeGamesStore.games.find(x => x.id == gameId);
    if( this.currentUser.username == game.player01.userName){
      return game.player01;
    }
    else{
      return game.player02;
    }
  }



  private initializeService(): void {    
    this.hubConnection.invoke('GetOnlineContacts')
      .then(result => {
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
    
    this.hubConnection.onclose(res =>{
      console.log('Connection Lost :', res);
      setTimeout(() => {
        console.log('Retry!');
      }, 3000);
    });

    this.hubConnection.on('connected', (name: string) => {
      this.addOnlineFriend(name);
    });

    this.hubConnection.on('disconnected', (name: string) => {      
      this.removeOnlineFriend(name);
    });

    this.hubConnection.on('newChallenge', (id:string, username:string, language:string, size :number) => {
      
      console.log('Challenge received from :', username);
      var challenge = new GameChallenge();
      challenge.id = id;
      challenge.challenger = username;
      challenge.language = language;
      challenge.size = size;

      this.receivedChallengeStore.challenges.push(challenge);      
      this._receivedChallenges.next(Object.assign({},this.receivedChallengeStore).challenges);
      this._lastReceivedChallenge.next(challenge);      
    });

    this.hubConnection.on('challengeAccepted', (challengeId:string,  accept:boolean, gameId:string) => {            
      var sChallenge = this.sentChallengeStore.challenges.find(c => c.id == challengeId);      
      var result = new GameChallengeResult(); 
      result.challenge = sChallenge;
      result.accepted = accept;
      result.gameId = gameId;
      
      var sChallengeIndex = this.sentChallengeStore.challenges.findIndex(c => c.id == challengeId);
      if (sChallengeIndex !== -1)
      {
        this.sentChallengeStore.challenges.splice(sChallengeIndex,1);
        this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
      }
      console.log('challenge result :', sChallenge.challenger, accept);
      this._sentChallengesResult.next( result);
     
    });
    

    
    this.hubConnection.on('sendToAll', (name: string, message: string) => {
      var newMsg = new ChatMessage();
      newMsg.date = Date.now().toString();
      newMsg.sender = name;
      newMsg.text = message;

      this.messageStore.messages.push(newMsg);      
      this._messages.next(Object.assign({}, this.messageStore).messages);
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
    console.log('User Joined :', name);
    if (this.friends.includes(name))
    {      
      this.onlineFriendStore.friends.push(name);
      this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }
  }
  private removeOnlineFriend(name:string ):void{
    console.log('User Left :', name);
    const index: number = this.onlineFriendStore.friends.indexOf(name);
    if (index !== -1) {
        this.onlineFriendStore.friends.splice(index, 1);
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }
  }

  
}
