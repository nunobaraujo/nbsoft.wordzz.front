import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from, BehaviorSubject, of } from 'rxjs';
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
import { GameManager } from '../Managers/gameManger';
import { PlayLetter } from '../Models/playLetter';
import { PlayRequest } from 'src/Requests/playRequest';
import { PlayResult } from '../Models/playResult';
import { Word } from '../Models/word';



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
  messages$ = this._messages.asObservable();

  private _isConnected = new BehaviorSubject<boolean>(false);
  isConnected$ = this._isConnected.asObservable();
  
  private _onlineFriends = new BehaviorSubject<string[]>([]);
  private onlineFriendStore: { friends: string[] } = { friends: [] }; 
  onlineFriends$ = this. _onlineFriends.asObservable();

  private _onlineOpponents = new BehaviorSubject<string[]>([]);
  private onlineOpponentsStore: { opponents: string[] } = { opponents: [] }; 
  onlineOpponents$ = this. _onlineOpponents.asObservable();

  private _receivedChallenges = new BehaviorSubject<GameChallenge[]>(null);  
  private receivedChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  receivedChallenges$ = this._receivedChallenges.asObservable();
  
  private _lastReceivedChallenge = new BehaviorSubject<GameChallenge>(null);
  lastReceivedChallenge$ = this._lastReceivedChallenge.asObservable();

  private _sentChallenges = new BehaviorSubject<GameChallenge[]>(null);  
  private sentChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  sentChallenges$ = this._sentChallenges.asObservable();

  private _sentChallengesResult = new BehaviorSubject<GameChallengeResult>(null);  
  sentChallengesResult$ = this._sentChallengesResult.asObservable();
  
  private activeGamesStore: { games: Game[] } = { games: [] }; // store our data in memory

  private _gameManagers = new BehaviorSubject<GameManager[]>(null);  
  private gameManagersStore: { gameManagers:  GameManager[] } ={ gameManagers: []};
  gameManagers$ = this._gameManagers.asObservable();
  
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
        .invoke('challengeGame', language, friend, size)      
      
      var c = new GameChallenge();
      Object.assign(c,res );
      console.log('Challenge :>> ',  c);

      this.sentChallengeStore.challenges.push(c);
      this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
      return  c.id;
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
  public acceptChallenge(challengeId:string , accept: boolean):Observable<string>{

    if (this._isConnected.value == true){
      var promise = (this.hubConnection
        .invoke('challengeAccept', challengeId, accept)
        .then<string>(gameId =>{
          const index:number = this.receivedChallengeStore.challenges.findIndex(({id})=> id === challengeId);
          if (index!==-1) {
            console.log('Removing Challenge :', index);
            this.receivedChallengeStore.challenges.splice(index, 1);
            this._receivedChallenges.next(Object.assign({},this.receivedChallengeStore).challenges);          
          }
          if (accept === true){
            this.router.navigateByUrl("/game-center/challenges")
            return gameId
          }
          else
            return null;
        })
        .catch(err => {
          console.error(err)
          return null
        }));
      return from(promise);
    }
    return null;

  }

  public getActiveGames():Observable<Game[]>
  {
    if (this._isConnected.value == true){
      var promise = (this.hubConnection.invoke('GetActiveGames').then(games=>{        
        this.activeGamesStore.games = games; 
        this.updateGameManagers();       
        this.updateOnlineOpponents();
        return this.activeGamesStore.games;
      }));    
      return from(promise);
    }
    return null;    
  }
  
  public getGame(id: string) {
    if (this._isConnected.value == true){
      return this.getActiveGames().pipe(
        map(games => games.find(game => game.id === id))
      );
    }
    return of(null);
  }
  public getManager(gameId:string):GameManager{
    return this.gameManagersStore.gameManagers.find(gm => gm.gameId == gameId);
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
  public getWordInfo(language: string, word: string):Observable<Word>{
    if (this._isConnected.value == true){
      var promise = (this.hubConnection.invoke('GetWordInfo',language, word)
      .then(iword=>{        
        return iword;
      }));    
      return from(promise);
    }
    return null;    
  }
  
  
  public play(gameId:string, letters: PlayLetter[]):Observable<PlayResult>{
    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;
    request.letters = letters;
    
    var promise = this.hubConnection    
      .invoke<PlayResult>('play', request)
      .then(res =>{        
        var result = new PlayResult();
        Object.assign(result,res);
        return result;
      })
      .catch(err =>{     
        console.log('err :>> ', err);
        var result = new PlayResult();
        result.moveResult = "KO";
        return result;
      });
    
    return from(promise);
  }
  public pass(gameId:string):Observable<PlayResult>{
    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;
    
    var promise = this.hubConnection    
      .invoke<PlayResult>('pass', request)
      .then(res =>{        
        var result = new PlayResult();
        Object.assign(result,res);
        return result;
      })
      .catch(err =>{     
        console.log('err :>> ', err);
        var result = new PlayResult();
        result.moveResult = "KO";
        return result;
      }); 
      return from(promise);
  }

  public updateOnlineContacts(){
    this.hubConnection.invoke('GetOnlineContacts')
      .then(result => {
        this.onlineFriendStore.friends = result;
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
      })
      .catch(err =>  {          
        this.onlineFriendStore.friends = [];
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
      });    
  }


  private initializeService(): void {    
    this.updateOnlineContacts();

    this.hubConnection.invoke('GetActiveGames')
      .then(games=>{        
        console.log("ActiveGames Changed");  
        this.activeGamesStore.games = games;
        this.updateGameManagers()        
        this.updateOnlineOpponents()
      })
      .catch(err =>  {          
        console.error(err);
        this.activeGamesStore.games = [];
        this.gameManagersStore.gameManagers = [];
        this._gameManagers.next(Object.assign({}, this.gameManagersStore).gameManagers);
      });

      this.hubConnection.invoke('GetSentChallenges').then(challenges=>{                
        this.sentChallengeStore.challenges = challenges;        
        console.log("sentChallengeStore:", this.sentChallengeStore.challenges);
        this._sentChallenges.next(Object.assign({}, this.sentChallengeStore).challenges);        
      })
      .catch(err =>  {          
        console.error(err);
        this.sentChallengeStore.challenges = [];
        this._sentChallenges.next(Object.assign({}, this.sentChallengeStore).challenges);
      });

      this.hubConnection.invoke('GetReceivedChallenges').then(challenges=>{
        this.receivedChallengeStore.challenges = challenges;        
        console.log("getReceivedChallenges:", this.receivedChallengeStore.challenges);
        this._receivedChallenges.next(Object.assign({}, this.receivedChallengeStore).challenges);
      })
      .catch(err =>  {          
        console.error(err);
        this.receivedChallengeStore.challenges = [];
        this._receivedChallenges.next(Object.assign({}, this.receivedChallengeStore).challenges);
      });    

  }

  

  private updateGameManagers(){
    // Check new Games
    this.activeGamesStore.games.forEach(g =>{      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == g.id);
      if (!manager){
        // No manager to this game, add it
        var manager = new GameManager(this,g.id);
        this.gameManagersStore.gameManagers.push(manager);
        this._gameManagers.next(Object.assign({}, this.gameManagersStore).gameManagers);
        console.log('New Game Mananager :', g.id);
      }
    });
    
    // Check removed games
    let managersToRemove :string[]=[];
    this.gameManagersStore.gameManagers.forEach(gm =>{
      var game = this.activeGamesStore.games.find(g => g.id == gm.gameId);
      if (!game)
      {
        // No game for this manager, remove it
        managersToRemove.push(gm.gameId);        
      }
    });
    managersToRemove.forEach(id => {
      let index = this.gameManagersStore.gameManagers.findIndex(gm => gm.gameId == id);
      if (index !== -1){
        this.gameManagersStore.gameManagers.splice(index,1);
        this._gameManagers.next(Object.assign({}, this.gameManagersStore).gameManagers);
        console.log('Game Mananager removed:', id);
      }
    });

  }
  private updateOnlineOpponents(){
    this.hubConnection.invoke('GetOnlineOpponents')
    .then(opponents=>{
      this.onlineOpponentsStore.opponents = opponents;
      this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
    })
    .catch(err =>  {          
      this.onlineOpponentsStore.opponents = [];          
      this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
    });
  }

  private reconnect(milliseconds:number):void {
    setTimeout(() => {
      console.log('Reconnecting...');
      this.connect();
    }, milliseconds);
  }
  private connect():void{

    this.contactsSubscription = this.userService.getContacts()
        .subscribe(c => this.friends = c);    

    this.hubConnection.start()
      .then(() => {
        this.initializeService();
        console.log('WebSocks connection state :>> ', this.hubConnection.state);   
        this.registerGameHubEvents();
        this._isConnected.next(true);
      })
      .catch(err =>{ 
        this._isConnected.next(false);
        console.log('WebSocks Error while establishing connection. Retry in 3 seconds');
        this.reconnect(3000);        
      });
  }
  private disconnect():void{
    if(this._isConnected.getValue()=== false)
    {
      return ;
    }
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

  private registerGameHubEvents():void{
    console.log('Registering GameHub Events ');
    
    // On Close
    this.hubConnection.onclose(res =>{
      console.log('Connection Lost :', res);
      this._isConnected.next(false);
      if (!this.authenticationService.currentUserValue){
        // User logged out
        console.log('WebSocks Connection Canceled!');
      }
      else
      {
        console.log('WebSocks Connection Lost. Retry in 3 seconds');
        this.reconnect(3000);
      }      
    });

    // On user connected
    this.hubConnection.on('connected', (name: string) => {
      this.addOnlineFriend(name);      
    });

    // On user disconnected
    this.hubConnection.on('disconnected', (name: string) => {      
      this.removeOnlineFriend(name);
    });

    // On challenge received
    this.hubConnection.on('newChallenge', (challenge:GameChallenge) => {
      
      console.log('Challenge received from :', challenge);
      
      this.receivedChallengeStore.challenges.push(challenge);      
      this._receivedChallenges.next(Object.assign({},this.receivedChallengeStore).challenges);
      this._lastReceivedChallenge.next(challenge);      
    });

    // On challenge accepted
    this.hubConnection.on('challengeAccepted', (challengeId:string,  accept:boolean, gameId:string) => {            
      var sChallenge = this.sentChallengeStore.challenges.find(c => c.id == challengeId);      
      var result = new GameChallengeResult(); 
      result.challenge = sChallenge;
      result.accepted = accept;
      result.gameId = gameId;

      console.log('challengeAccepted :>> ', result);
      
      var sChallengeIndex = this.sentChallengeStore.challenges.findIndex(c => c.id == challengeId);
      if (sChallengeIndex !== -1)
      {
        this.sentChallengeStore.challenges.splice(sChallengeIndex,1);
        this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
      }      
      this._sentChallengesResult.next( result);
     
    });
        
    // On send message to global
    this.hubConnection.on('sendToAll', (name: string, message: string) => {
      var newMsg = new ChatMessage();
      newMsg.date = Date.now().toString();
      newMsg.sender = name;
      newMsg.text = message;

      this.messageStore.messages.push(newMsg);      
      this._messages.next(Object.assign({}, this.messageStore).messages);
    });

    // On new play received
    this.hubConnection.on('playOk', (gameId:string ,username: string ) => {
      let manager = this.getManager(gameId);
      manager.playReceived(username);
    });
  }

  
  private addOnlineFriend(name:string ):void{
    //console.log('User Joined :', name);
    if (this.friends.includes(name))
    {      
      this.onlineFriendStore.friends.push(name);
      this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }
    this.activeGamesStore.games.forEach(g => {
      if(g.player01.userName === name || g.player02.userName === name){
        this.onlineOpponentsStore.opponents.push(name);
        this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
      }
    });
  }
  private removeOnlineFriend(name:string ):void{
    //console.log('User Left :', name);
    const index: number = this.onlineFriendStore.friends.indexOf(name);
    if (index !== -1) {
        this.onlineFriendStore.friends.splice(index, 1);
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }

    const indexOp: number = this.onlineOpponentsStore.opponents.indexOf(name);
    if (indexOp !== -1) {
      this.onlineOpponentsStore.opponents.splice(index, 1);
      this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
    }
  }

  

  
}
