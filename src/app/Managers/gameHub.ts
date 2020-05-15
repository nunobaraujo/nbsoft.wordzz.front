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


import { PlayLetter } from '../Models/playLetter';
import { PlayRequest } from 'src/Requests/playRequest';
import { PlayResult } from '../Models/playResult';
import { GameResult } from '../Models/gameResult';

import { PlayReceived } from '../Models/playReceived';

@Injectable({
  providedIn: 'root'
})
export class GameHub implements OnDestroy {
  private hubConnection: HubConnection;  
      
  currentUser: User;    
  private _messages = new BehaviorSubject<ChatMessage[]>([]);
  private messageStore: { messages: ChatMessage[] } = { messages: [] }; // store our data in memory
  messages$ = this._messages.asObservable();

  private _isConnected = new BehaviorSubject<boolean>(false);
  isConnected$ = this._isConnected.asObservable();
  isConnected:boolean;
  
    
  private _receivedChallenge = new BehaviorSubject<GameChallenge>(null);
  receivedChallenge$ = this._receivedChallenge.asObservable();

 
  private _challengeAccepted = new BehaviorSubject<GameChallengeResult>(null);  
  challengeAccepted$ = this._challengeAccepted.asObservable();
  
  private _challengeCanceled = new BehaviorSubject<string>(null);  
  challengeCanceled$ = this._challengeCanceled.asObservable();
  
  
  private _playReceived = new BehaviorSubject<PlayReceived>(null);  
  playReceived$ = this. _playReceived.asObservable();

  private _searchingGame = new BehaviorSubject<string>(null);  
  private searchingGame:string = "";
  searchingGame$ = this._searchingGame.asObservable();
  
  private _endedGames = new BehaviorSubject<GameResult>(null);    
  endedGames$ = this._endedGames.asObservable();

  private _userArrived = new BehaviorSubject<string>(null);    
  userArrived$ = this._userArrived.asObservable();

  private _userLeft = new BehaviorSubject<string>(null);    
  userLeft$ = this._userLeft.asObservable();
  
  private stopSearch:boolean;
  
  constructor(authService:AuthenticationService) {
    authService.currentUser.subscribe(u =>{
      this.currentUser = u;
      if (!!u){
        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/hubs/game`, { accessTokenFactory: () => this.currentUser.token })
        .build();
      }
      else
      {
        try{this.disconnect();}
        catch{ ex=>console.log('Error ', ex); }        
      }

    });

    
  }
  ngOnDestroy(): void {
 
  } 

  
  public sendMessage(message: string): void {
    if (this.isConnected !== true){ return null; }
    this.hubConnection
      .invoke('broadCastMessage', this.currentUser.username, message)
      .catch(err => console.error(err));
  }
        
  public acceptChallengeOls(challengeId:string , accept: boolean):Promise<string>{
    return this.hubConnection.invoke('challengeAccept', challengeId, accept);
  }
  
  
  public async play(gameId:string, letters: PlayLetter[]):Promise<PlayResult>{
    if (this.isConnected !== true){ return null; }

    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;
    request.letters = letters;
    
    return await  this.hubConnection    
      .invoke<PlayResult>('play', request)
      .then(res =>res)
      .catch(err =>{     
        console.log('err :>> ', err);
        var result = new PlayResult();
        result.moveResult = "KO";
        return result;
      });    
  }
  public async pass(gameId:string):Promise<PlayResult>{
    if (this.isConnected !== true){ return null; }

    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;
    
    return await this.hubConnection    
      .invoke<PlayResult>('pass', request)
      .then(res =>res)
      .catch(err =>{     
        console.log('err :>> ', err);
        var result = new PlayResult();
        result.moveResult = "KO";
        return result;
      }); 
  }
  public async forfeit(gameId:string):Promise<PlayResult>{
    if (this.isConnected !== true){ return null; }
    
    let request = new PlayRequest();
    request.gameId = gameId;
    request.userName = this.currentUser.username;

    return await this.hubConnection    
      .invoke<PlayResult>('forfeit', request)
      .then(res =>res)
      .catch(err =>{     
        console.log('err :>> ', err);
        var result = new PlayResult();
        result.moveResult = "KO";
        return result;
      }); 
  }
  


  private initializeService() {
    
    console.log('initializeService :>> ');
    
    /*this.hubConnection.invoke('GetSentChallenges').then(challenges=>{                
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
    });    */

  }

  public async waitForGame(){
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
            //await this.gameService.refreshGames();              
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
  
  public getOnlineContacts():Promise<string[]>{
    if (this.isConnected !== true){ return null; }

    return this.hubConnection.invoke('GetOnlineContacts');
  }
  public getOnlineOpponents():Promise<string[]>{
    if (this.isConnected !== true){ return null; }

    return this.hubConnection.invoke('GetOnlineOpponents');    
  }

  private async getGameMatch():Promise<string>{
    if (this.isConnected !== true){ return null; }    
    return await this.hubConnection.invoke<string>('getGameMatch')
      .catch(err=> {
        return `Error: ${err}`
    });;    
  }

  


  
 
  

  public reconnect(milliseconds:number):void {       
    if (!this.currentUser){
      return;
    }
    setTimeout(() => {
      console.log('Reconnecting...');
      this.connect();
    }, milliseconds);
  }
  public connect():void{
    

    this.hubConnection.start()
      .then(async () => {        
        console.log('WebSocks connection state :>> ', this.hubConnection.state);   
        this.isConnected = true;
        this.registerGameHubEvents();
        await this.initializeService();
        this._isConnected.next(this.isConnected);
      })
      .catch(err =>{ 
        this.isConnected = false;
        this._isConnected.next(this.isConnected);
        console.log('WebSocks Error while establishing connection. Retry in 3 seconds');
        this.reconnect(3000);        
      });
  }
  public disconnect():void{    
    if(this.isConnected === false)
    {
      return ;
    }
    
    
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
      this.isConnected = false;
      this._isConnected.next(this.isConnected);
      this.reconnect(3000);
    });

    // On user connected
    this.hubConnection.on('connected', (name: string) => {
      console.log('User Connected :>> ', name);
      this._userArrived.next(name);
      this._userArrived.next(null);      
    });

    // On user disconnected
    this.hubConnection.on('disconnected', (name: string) => {      
      console.log('User Disconnected :>> ', name);
      this._userLeft.next(name);
      this._userLeft.next(null);      
    });

    // On challenge received
    this.hubConnection.on('newChallenge', (challenge:GameChallenge) => {            
      this._receivedChallenge.next(challenge);      
      this._receivedChallenge.next(null);      
    });

    // On challenge accepted
    this.hubConnection.on('challengeAccepted', (challengeId:string,  accept:boolean, gameId:string) => {            
      console.log('challengeAccepted :>> ',challengeId);

      var result = new GameChallengeResult(); 
      result.challengeId = challengeId;
      result.accepted = accept;
      result.gameId = gameId;
      this._challengeAccepted.next(result);
      this._challengeAccepted.next(null);    
           
    });
     // On challenge Canceled
     this.hubConnection.on('challengeCanceled', (challengeId:string) => {
      console.log('challengeCanceled:>> ',challengeId);
      this._challengeCanceled.next(challengeId)
      this._challengeCanceled.next(null);    
           
    });
        
    // On send message to global
    this.hubConnection.on('broadCastMessage', (name: string, message: string) => {
      var newMsg = new ChatMessage();
      newMsg.date = Date.now().toString();
      newMsg.sender = name;
      newMsg.text = message;

      this.messageStore.messages.push(newMsg);      
      this._messages.next(Object.assign({}, this.messageStore).messages);
    });

    // On new play received
    this.hubConnection.on('playOk', (gameId:string ,username: string ) => {
      let play = new PlayReceived();
      play.gameId = gameId;
      play.userName = username;
      this._playReceived.next(play);
      this._playReceived.next(null);
    });

    // On opposer forfeit
    this.hubConnection.on('gameOver', (gameId:string, result: GameResult) => {      
      this._endedGames.next(Object.assign({},result));
      this._endedGames.next(null);
    });      
    // On match found
    this.hubConnection.on('gameMatchFound', (gameId:string) => {      
      console.log('gameMatchFound :>> ', gameId);
    });    
  }  
}
