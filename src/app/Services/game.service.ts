import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

import { GameQueue } from '../Models/gameQueue';
import { GameChallenge } from '../Models/gameChallenge';
import { GameManager } from '../Managers/gameManger';
import { Game } from '../Models/game';
import { GamePlayer } from '../Models/gamePlayer';
import { User } from '../Models/user';
import { AuthenticationService } from './authentication.service';
import { GameHub } from '../Managers/gameHub';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  
  private _gameManagers = new BehaviorSubject<GameManager[]>(null);  
  private gameManagersStore: { gameManagers:  GameManager[] } ={ gameManagers: []};
  currentUser: User;
  gameManagers$ = this._gameManagers.asObservable();

  constructor(private http: HttpClient,private gameHub:GameHub, authenticationService:AuthenticationService) { 
    authenticationService.currentUser.subscribe(u => this.currentUser = u);
    
    this.apiGetQueuedGames(this.currentUser.username)
      .then(q => {
        if (q.length>0){
          this.gameHub.waitForGame()
        }
    });

    this.registerPlayReceived();

    

  }
  private registerPlayReceived(){
    this.gameHub.playReceived$.subscribe(play => {
      if(!play) { return; }
      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == play.gameId);
      if(!!manager){
        manager.onPlayReceived(play.userName); 
      }
      this.gameHub.clearPlayReceived();
    });    
  }
  private registerGameOver(){
    this.gameHub.endedGames$.subscribe(gameResult => {
      if(!play) { return; }
      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == play.gameId);
      if(!!manager){
        manager.onPlayReceived(play.userName); 
      }
      this.gameHub.clearPlayReceived();
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
      console.log('gameQueue :>> ', gameQueue);
      this.gameHub.waitForGame();
      return gameQueue.id;     
    }
    catch (err) {
      console.error(err);
      return "";
    }      

  }  

  private updateGameManagers(games:Game[]){    
    console.log('updateGameManagers!');

    // Check new Games
    games.forEach(g =>{      
      var manager = this.gameManagersStore.gameManagers.find(gm => gm.gameId == g.id);
      if (!manager){
        // No manager to this game, add it
        var manager = new GameManager(this.gameHub,g.id);
        this.gameManagersStore.gameManagers.push(manager);
        this._gameManagers.next(Object.assign({}, this.gameManagersStore).gameManagers);
        console.log('New Game Mananager :', g.id);
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
        console.log('Game Mananager removed:', id);
      }
    });

  }

  

//#region API calls

  private apiGetGames(userName:string): Promise<Game[]>{
    var promise = new Promise<Game[]>((resolve,reject) =>{
      this.http.get<Game[]>(`${environment.apiUrl}/game/${userName}`)
      .toPromise()
      .then(res =>{  
        console.log('active Games :>> ', res);
        resolve(res);
      },
      msg=>{
        console.log('Rejected :>> ', msg);
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
        console.log('Rejected :>> ', msg);
        reject(msg);
      })
    });
    return promise;
  }

  private apiQueueChallenge (language:string, boardId:number, challenged:string):Observable<GameChallenge>{
    return this.http.post<GameChallenge>(`${environment.apiUrl}/game/challenge`, { language , boardId ,challenged})
    .pipe(map(stats => {
      if (!stats) {
        return null;
      }

      let retval:GameChallenge = new GameChallenge();
      Object.assign(retval, stats)
      return retval;
    }));
  }

  private apiGetChallengesSent():Observable<GameChallenge[]>{
    return this.http.get<GameChallenge[]>(`${environment.apiUrl}/game/challenge`)
    .pipe(map(stats => {
      if (!stats) {
        return null;
      }
      let retval:GameChallenge[] =[];
      Object.assign(retval, stats)
      return retval;
    }));
  }
  private apiGetChallengesReceived():Observable<GameChallenge[]>{
    return this.http.get<GameChallenge[]>(`${environment.apiUrl}/game/challenge/received`)
    .pipe(map(stats => {
      if (!stats) {
        return null;
      }
      let retval:GameChallenge[] =[];
      Object.assign(retval, stats)
      return retval;
    }));
  }
//#endregion

    

}
