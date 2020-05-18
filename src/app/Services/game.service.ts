import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { AuthenticationService } from './authentication.service';

import { GameQueue } from '../Models/gameQueue';
import { GameChallenge } from '../Models/gameChallenge';
import { GameManager } from '../Managers/gameManger';
import { Game } from '../Models/game';
import { GamePlayer } from '../Models/gamePlayer';
import { User } from '../Models/user';
import { GameHub } from '../Managers/gameHub';
import { GameResult } from '../Models/gameResult';
import { PlayLetter } from '../Models/playLetter';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { GameChallengeResult } from '../Models/gameChallengeResult';
import { LexiconService } from './lexicon.service';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  private _gameManagers = new BehaviorSubject<GameManager[]>(null);  
  private gameManagersStore: { gameManagers:  GameManager[] } ={ gameManagers: []};
  friends: string[] = [];
  currentUser: User;
  gameManagers$ = this._gameManagers.asObservable();

  private _endedGames = new BehaviorSubject<GameResult[]>(null);  
  private endedGamesStore: { games:  GameResult[] } ={ games: []};
  endedGames$ = this._endedGames.asObservable();

  private _onlineFriends = new BehaviorSubject<string[]>([]);
  private onlineFriendStore: { friends: string[] } = { friends: [] }; 
  onlineFriends$ = this. _onlineFriends.asObservable();

  private _onlineOpponents = new BehaviorSubject<string[]>([]);
  private onlineOpponentsStore: { opponents: string[] } = { opponents: [] }; 
  onlineOpponents$ = this. _onlineOpponents.asObservable();

  private _receivedChallenges = new BehaviorSubject<GameChallenge[]>(null);  
  private receivedChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  receivedChallenges$ = this._receivedChallenges.asObservable();

  private _sentChallenges = new BehaviorSubject<GameChallenge[]>(null);  
  private sentChallengeStore: { challenges:  GameChallenge[] } ={ challenges: []};
  sentChallenges$ = this._sentChallenges.asObservable();

  private _challengeResults = new BehaviorSubject<GameChallengeResult>(null);    
  challengeResults$ = this._challengeResults.asObservable();
  
  private contactSubscription: Subscription;
  constructor(private http: HttpClient, private router:Router, authenticationService:AuthenticationService,private userService:UserService,private lexiconService:LexiconService, private gameHub:GameHub) { 
    authenticationService.currentUser.subscribe(u => {
      this.currentUser = u;
      if (!!u){     
        this.contactSubscription = this.userService.getContacts().subscribe(c => this.friends = c);
        this.apiGetChallengesReceived().then(challenges=>{
          this.receivedChallengeStore.challenges = challenges;
          this._receivedChallenges.next(Object.assign({}, this.receivedChallengeStore).challenges);
        })

        this.apiGetChallengesSent().then(challenges=>{
          this.sentChallengeStore.challenges = challenges;
          this._sentChallenges.next(Object.assign({}, this.sentChallengeStore).challenges);
        })

        this.apiGetQueuedGames(this.currentUser.username)
        .then(q => {
          if (q.length>0){            
            var search = q.find(sg => sg.player1 == this.currentUser.username && !sg.player2);
            if (!! search){
              this.gameHub.waitForGame()
            }
          }        
          this.registerPlayReceived();
          this.registerGameOver();
          this.registerUserArrived();
          this.registerUserLeft();
          this.registerReceivedChallenge();
          this.registerChallengeAccepted();
          this.registerChallengeCanceled();
          this.registerSearchingGame();

          this.updateOnlineContacts().then();
          this.updateOnlineOpponents().then();
        })
        .catch(err => authenticationService.logout() );
        
      }
    });
  }

  private registerChallengeCanceled(){
    this.gameHub.challengeCanceled$.subscribe(challengeId =>{
      if (!!challengeId){        
        this.apiGetChallengesReceived().then(challenges=>{
          this.receivedChallengeStore.challenges = challenges;
          this._receivedChallenges.next(Object.assign({}, this.receivedChallengeStore).challenges);
        })
      }
    });
  }
  private registerSearchingGame(){
    this.gameHub.searchingGame$.subscribe(s=>{
      if (s !=="searching")        
      {
        this.refreshGames().then(() => {
          this.updateOnlineOpponents();
        });
      }
    });
  }
  private registerChallengeAccepted(){
    this.gameHub.challengeAccepted$.subscribe(challengeResult =>{
      if (!!challengeResult){
        
        var sChallenge = this.sentChallengeStore.challenges.find(c => c.id == challengeResult.challengeId);
        challengeResult.challenge = sChallenge;

        var sChallengeIndex = this.sentChallengeStore.challenges.findIndex(c => c.id == challengeResult.challengeId);
        if (sChallengeIndex !== -1)
        {
          this.sentChallengeStore.challenges.splice(sChallengeIndex,1);
          this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
        }        

        if (challengeResult.accepted){
          this.refreshGames().then(() => {
            this.updateOnlineOpponents().then();
          });
        }
        
        this._challengeResults.next(Object.assign({},challengeResult));
        this._challengeResults.next(null);
      }
    });
  }
  private registerReceivedChallenge(){
    this.gameHub.receivedChallenge$.subscribe(challenge =>{
      if (!!challenge){
        this.receivedChallengeStore.challenges.push(challenge);
        this._receivedChallenges.next(Object.assign({}, this.receivedChallengeStore).challenges);
      }
    });

  }
  private registerUserArrived(){
    this.gameHub.userArrived$.subscribe(user =>{
      if (!!user){
        this.addOnlineFriend(user)
      }
    });

  }
  private registerUserLeft(){
    this.gameHub.userLeft$.subscribe(user =>{
      if (!!user){
        this.removeOnlineFriend(user)
      }
    });
  }
  private registerPlayReceived(){
    this.gameHub.playReceived$.subscribe(play => {
      if(!play) { return; }
      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == play.gameId);
      if(!!manager){
        manager.onPlayReceived(play.userName); 
      }      
    });    
  }
  private registerGameOver(){
    this.gameHub.endedGames$.subscribe(gameResult => {
      if(!gameResult) { return; }
      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == gameResult.gameId);
      if(!!manager){
        manager.onGameOverReceived(gameResult); 
      }
      this.endedGamesStore.games.push(gameResult);
      this._endedGames.next(Object.assign({},this.endedGamesStore).games);
      
      this.refreshGames().then();

    });    
  }


  public getActiveGames():Observable<Game[]>{
    return from(this.refreshGames());
  }

  public getGame(id: string):Observable<Game> {    
    return this.getActiveGames().pipe(
      map(games => games.find(game => game.id === id))
    );
  }
  public refreshGames():Promise<Game[]>{
    var promise = this.apiGetGames(this.currentUser?.username)
      .then(gms => {
        this.updateGameManagers(gms);
        return gms;
      });
    return promise;
  }


  public getManager(gameId:string):GameManager{    
    return this.gameManagersStore.gameManagers.find(gm => gm.gameId == gameId);
  }
  public getOpponent(gameId:string):GamePlayer{
    var manager = this.gameManagersStore.gameManagers.find(x => x.gameId == gameId);
    return manager?.getOpponent();
  }
  public getPlayer(gameId:string):GamePlayer{    
    var manager = this.gameManagersStore.gameManagers.find(x => x.gameId == gameId);
    return manager.getPlayer();
  }
  public async searchGame(language:string, boardId:number):Promise<string>{
    try {
      let gameQueue = await this.apiQueueGame(language,boardId);      
      this.gameHub.waitForGame();
      return gameQueue.id;     
    }
    catch (err) {
      console.error(err);
      return "";
    }      
  }  
  public async challengeGame(language:string, boardId:number , challengedPlayer:string){
    var challenge = await this.apiQueueChallenge(language, boardId , challengedPlayer);
    if (!!challenge){
      this.sentChallengeStore.challenges.push(challenge);
      this._sentChallenges.next(Object.assign({},this.sentChallengeStore).challenges);
    }
  }
  public async cancelChallenge(challengedPlayer:string){
    var challenge = this.sentChallengeStore.challenges.find(x => x.destination == challengedPlayer);
    if (!challenge){
      return;
    }
    var canceled = await this.apiCancelChallenge(challenge.id);
    if (canceled){
      this.apiGetChallengesSent().then(challenges=>{
        this.sentChallengeStore.challenges = challenges;
        this._sentChallenges.next(Object.assign({}, this.sentChallengeStore).challenges);
      })
    }
  }
  public getGameResult(gameId:string):GameResult{
    var game = this.endedGamesStore.games.find(g => g.gameId == gameId);
    var index = this.endedGamesStore.games.findIndex(g => g.gameId == gameId);
    this.endedGamesStore.games.splice(index,1);
    this._endedGames.next(Object.assign({},this.endedGamesStore).games);
    return game;
  }

  public play(gameId:string, playLetter: PlayLetter[]){
    return this.gameHub.play(gameId,playLetter);

  }
  public pass(gameId:string){
    return this.gameHub.pass(gameId);
  }
  public async forfeit(gameId:string){    
    var res =  await this.gameHub.forfeit(gameId);
    await this.updateOnlineOpponents();
    await this.refreshGames();
    
    return res;
  }

  public async acceptChallenge(challengeId:string , accept: boolean){
    
    var game = await this.apiAcceptChallenge(challengeId, accept);
    const index:number = this.receivedChallengeStore.challenges.findIndex(({id})=> id === challengeId);
    if (index!==-1) {
      this.receivedChallengeStore.challenges.splice(index, 1);
      this._receivedChallenges.next(Object.assign({},this.receivedChallengeStore).challenges);          
    }

    if (accept){      
      await this.refreshGames();
      await this.updateOnlineOpponents();      
      this.router.navigateByUrl(`/game-center/${game.id}`)
      return game.id
    }
    return null;
  }

  private updateGameManagers(games:Game[]){
    // Check new Games
    games.forEach(g =>{      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == g.id);
      if (!manager){
        // No manager to this game, add it
        var manager = new GameManager(this,this.lexiconService,g.id);
        this.gameManagersStore.gameManagers.push(manager);
        this._gameManagers.next(Object.assign({}, this.gameManagersStore).gameManagers);
      }
    });
    
    // Check removed games
    let managersToRemove :string[]=[];
    this.gameManagersStore.gameManagers.forEach(gm =>{
      var game = games.find(g => g.id == gm.gameId);
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
      }
    });

  }
  public async updateOnlineOpponents(){
    if (!!this.contactSubscription){
      this.contactSubscription.unsubscribe();
    }
    this.contactSubscription = this.userService.getContacts().subscribe(c => this.friends = c);
    this.gameHub.isConnected$.subscribe(async connected =>{
      if (connected) {
        this.onlineOpponentsStore.opponents = await this.gameHub.getOnlineOpponents();
        this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
      }
      else{
        this.onlineOpponentsStore.opponents = [];
        this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
      }
    });    
  }
  public async updateOnlineContacts(){
    if (!!this.contactSubscription){
      this.contactSubscription.unsubscribe();
    }
    this.contactSubscription = this.userService.getContacts().subscribe(c => this.friends = c);
    this.gameHub.isConnected$.subscribe(async connected =>{
      if (connected) {
        this.onlineFriendStore.friends = await this.gameHub.getOnlineContacts();
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);    
      }
      else{
        this.onlineFriendStore.friends = [];
        this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);    
      }
    })
    
    
  }
  private addOnlineFriend(name:string ):void{
    this.userService.getContacts()
        .subscribe(c => this.friends = c);
    if (this.friends.includes(name))
    {      
      this.onlineFriendStore.friends.push(name);
      this._onlineFriends.next(Object.assign({}, this.onlineFriendStore).friends);
    }   
    
    this.gameManagersStore.gameManagers.forEach(g => {
      if(g.game.player01.userName === name || g.game.player02.userName === name){
        this.onlineOpponentsStore.opponents.push(name);
        this._onlineOpponents.next(Object.assign({}, this.onlineOpponentsStore).opponents);
      }
    });    
  }
  private removeOnlineFriend(name:string ):void{
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


  

//#region API calls

  private apiGetGames(userName:string): Promise<Game[]>{
    if (!userName){
      return new Promise(null);
    }
    var promise = new Promise<Game[]>((resolve,reject) =>{
      this.http.get<Game[]>(`${environment.apiUrl}/game/${userName}`)
      .toPromise()
      .then(res =>{
        resolve(res);
      },
      msg=>{        
        reject(msg);
      })
    });
    return promise;
  }

  private apiQueueGame(language:string, boardId:number):Promise<GameQueue>{
    var promise = new Promise<GameQueue>((resolve,reject) =>{
      this.http.post<GameQueue>(`${environment.apiUrl}/game/queue`, { language , boardId })
      .toPromise()
      .then(res =>{        
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }
  private apiGetQueuedGames(userName:string):Promise<GameQueue[]>{
    var promise = new Promise<GameQueue[]>((resolve,reject) =>{
      this.http.get<GameQueue[]>(`${environment.apiUrl}/game/queue/${userName}`)
      .toPromise()
      .then(res=>{
        resolve(res);
      },
      msg=>{        
        reject(msg);
      })
    });
    return promise;
  }

  private apiQueueChallenge (language:string, boardId:number, challenged:string):Promise<GameChallenge>{
    var promise = new Promise<GameChallenge>((resolve,reject) =>{
      this.http.post<GameChallenge>(`${environment.apiUrl}/game/challenge`, { language , boardId ,challenged})
      .toPromise()
      .then(res =>{        
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }

  private apiGetChallengesSent():Promise<GameChallenge[]>{
    var promise = new Promise<GameChallenge[]>((resolve,reject) =>{
      this.http.get<GameChallenge[]>(`${environment.apiUrl}/game/challenge`)
      .toPromise()
      .then(res =>{        
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  } 
  private apiCancelChallenge(challengeId:string):Promise<boolean>{
    var promise = new Promise<boolean>((resolve,reject) =>{
      this.http.delete<boolean>(`${environment.apiUrl}/game/challenge/${challengeId}`)
      .toPromise()
      .then(res =>{        
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }

  private apiGetChallengesReceived():Promise<GameChallenge[]>{
    var promise = new Promise<GameChallenge[]>((resolve,reject) =>{
      this.http.get<GameChallenge[]>(`${environment.apiUrl}/game/challenge/received`)
      .toPromise()
      .then(res =>{        
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }
  private apiAcceptChallenge(challengeId:string, accept:boolean):Promise<Game>{
    var promise = new Promise<Game>((resolve,reject) =>{
      this.http.post<Game>(`${environment.apiUrl}/game/challenge/received`, {challengeId,accept})
      .toPromise()
      .then(res =>{        
        console.log('resolved :>> ', res);
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }
//#endregion

    

}
