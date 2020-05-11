import { Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { HubConnection } from '@aspnet/signalr';
import { Subscription, Observable, from, BehaviorSubject, of, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { AuthenticationService } from '../Services/authentication.service';
import { UserService } from '../Services/user.service';

import { User } from '../Models/user';
import { ChatMessage } from '../Models/chatMessage';
import { GameChallenge } from '../Models/gameChallenge';
import { GameChallengeResult } from '../Models/gameChallengeResult';
import { Game } from '../Models/game';
import { GamePlayer } from '../Models/gamePlayer';

import { GameManager } from './gameManger';
import { PlayLetter } from '../Models/playLetter';
import { PlayRequest } from 'src/Requests/playRequest';
import { PlayResult } from '../Models/playResult';
import { GameResult } from '../Models/gameResult';
import { GameService } from '../Services/game.service';

@Injectable({
  providedIn: 'root'
})
export class GameHub implements OnDestroy {
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
  
  
  private _searchingGame = new BehaviorSubject<string>(null);  
  private searchingGame:string = "";
  searchingGame$ = this._searchingGame.asObservable();
  
  private _endedGames = new BehaviorSubject<GameResult[]>(null);  
  private endedGamesStore: { games:  GameResult[] } ={ games: []};
  endedGames$ = this._endedGames.asObservable();
  
  private stopSearch:boolean;
  
  constructor(private router:Router,
    private gameService:GameService,
    private authenticationService: AuthenticationService, 
    private userService:UserService) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/game`, { accessTokenFactory: () => this.currentUser.token })
      .build();
    
    this.userSubscription = this.authenticationService.currentUser.subscribe(x =>{
      this.currentUser = x;
      if (!this.currentUser?.username) {
        this.disconnect();
      }
      else {
        console.log("GameHub.Connect");
        this.connect();
      }
    });
  }
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();

    if(!!this.contactsSubscription){
      this.contactsSubscription.unsubscribe();}
  } 

  public updateOnlineContacts(){
    if (this._isConnected.value !== true){ return; }

    this.getOnlineContacts()
      .then(result => {
        this.onlineFriendStore.friends = result;
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
      })
      .catch(err =>  {          
        this.onlineFriendStore.friends = [];
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
      });
  }
  public sendMessage(message: string): void {
    if (this._isConnected.value !== true){ return null; }
    this.hubConnection
      .invoke('sendToAll', this.currentUser.username, message)
      .catch(err => console.error(err));
  }
  public newSoloGame():string
  {
    return ""
  }  

  public async searchGame(language:string, boardId:number){
    try {
      let gameQueue = await this.gameService.queueGame(language,boardId);
      console.log('gameQueue :>> ', gameQueue);
      this.waitForGame();

      return gameQueue.id;     
    }
    catch (err) {
      console.error(err);
      return "";
    }      

  }
  
  public async challengeGame(language:string, boardId:number , challengedPlayer:string):Promise<string>
  {    
    if (this._isConnected.value !== true){ return null; }
    try {
      let res = await this.hubConnection.invoke('challengeGame', language, boardId ,challengedPlayer)      
      
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
  public acceptChallenge(challengeId:string , accept: boolean):Observable<string>{
    if (this._isConnected.value !== true){ return null; }

    var promise = (this.hubConnection.invoke('challengeAccept', challengeId, accept)
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


  public getGameResult(gameId:string):GameResult{
    if (this._isConnected.value !== true){ return null; }

    var game = this.endedGamesStore.games.find(g => g.gameId == gameId);
    var index = this.endedGamesStore.games.findIndex(g => g.gameId == gameId);
    this.endedGamesStore.games.splice(index,1);
    this._endedGames.next(Object.assign({},this.endedGamesStore).games);
    return game;
  }
  
  public async play(gameId:string, letters: PlayLetter[]):Promise<PlayResult>{
    if (this._isConnected.value !== true){ return null; }

    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;
    request.letters = letters;
    
    return await  this.hubConnection    
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
  }
  public pass(gameId:string):Observable<PlayResult>{
    if (this._isConnected.value !== true){ return null; }

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
  public forfeit(gameId:string):Observable<PlayResult>{
    if (this._isConnected.value !== true){ return null; }
    
    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;

    var promise = this.hubConnection    
      .invoke<PlayResult>('forfeit', request)
      .then(res =>{        
        
        this.loadActiveGames().then( g => {console.log('Games:', g)});
        
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
  


  private async initializeService() {
    var gameQueues = await this.gameService.getQueuedGames(this.currentUser.username);
    if (gameQueues.length>0){
      this.waitForGame()
    }

    this.updateOnlineContacts();

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

  private waitForGame(){
    this.searchingGame = "searching";
    this._searchingGame.next(this.searchingGame);
    this.stopSearch = false;
    var searchGameSubscription = interval(3000)
      .pipe(takeWhile(() => !this.stopSearch))
      .subscribe(async () => {
        
        var getMatchResult = await this.getGameMatch();
        if (!!getMatchResult){            
          this.stopSearch == true;            
          searchGameSubscription.unsubscribe();
          if (!getMatchResult.startsWith("Error")){
            console.log('Match Found!',getMatchResult);
            this.loadActiveGames().then( g => {console.log('Games:', g)});              
            setTimeout(() => {
              this.searchingGame = getMatchResult;
              this._searchingGame.next(this.searchingGame);              
              this.searchingGame = "";
              this._searchingGame.next(this.searchingGame);            
            }, 1000);
          }
          else{
            console.log('SearchGame Error:', getMatchResult);
          }
        }
    });
  }

  public updateOnlineOpponents(){
    if (this._isConnected.value !== true){ return; }

    this.getOnlineOpponents()
    .then(opponents=>{
      this.onlineOpponentsStore.opponents = opponents;
      this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
    })
    .catch(err =>  {          
      this.onlineOpponentsStore.opponents = [];          
      this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
    });
  }
  

  private getOnlineContacts():Promise<string[]>{
    if (this._isConnected.value !== true){ return null; }

    return this.hubConnection.invoke('GetOnlineContacts');
  }
  
  private getOnlineOpponents():Promise<string[]>{
    if (this._isConnected.value !== true){ return null; }

    return this.hubConnection.invoke('GetOnlineOpponents');    
  }

  private async getGameMatch():Promise<string>{
    if (this._isConnected.value !== true){ return null; }

    return await this.hubConnection.invoke<string>('getGameMatch')
      .catch(err=> {
        return `Error: ${err}`
    });;    
  }

  


  private addOnlineFriend(name:string ):void{
    if (this._isConnected.value !== true){ return; }
    
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
    if (this._isConnected.value !== true){ return; }
    
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
      .then(async () => {
        await this.initializeService();
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
      this._lastReceivedChallenge.next(null);      
    });

    // On challenge accepted
    this.hubConnection.on('challengeAccepted', (challengeId:string,  accept:boolean, gameId:string) => {            
      if (accept=== true){
        this.loadActiveGames().then( g => {console.log('Games:', g)});
      }
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
      this._sentChallengesResult.next( null);     
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
      manager.onPlayReceived(username);
    });

    // On opposer forfeit
    this.hubConnection.on('gameOver', (gameId:string, result: GameResult) => {
      this.endedGamesStore.games.push(result);      
      this._endedGames.next(Object.assign({},this.endedGamesStore).games);

      this.loadActiveGames().then( g => {console.log('Games:', g)});
      let manager = this.getManager(gameId);
      manager.onGameOverReceived(result);
    });    
  }  
}
