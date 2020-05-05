import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { faTrophy,faCrosshairs } from '@fortawesome/free-solid-svg-icons';

import { Game } from 'src/app/Models/game';

import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';


@Component({
  selector: 'app-gc-home',
  templateUrl: './gc-home.component.html',
  styleUrls: ['./gc-home.component.scss']
})
export class GcHomeComponent implements OnInit, OnDestroy {
  faTrophy = faTrophy;
  faCrosshairs = faCrosshairs;
  private gameServiceConnected:Subscription;  
  private activeGamesSubscription:Subscription;
  games$: Observable<Game[]>;
  games: Game[];

  gamesManagers:GameManager[];
  constructor(private gameService: GameService) {    
    this.gameServiceConnected = this.gameService.isConnected$.subscribe(connected =>    {
      if (connected){        
        this.games$ = this.gameService.getActiveGames();
        this.activeGamesSubscription = this.games$.subscribe(g =>{ 
          this.games = g;          
        });
        
        this.gameService.gameManagers$.subscribe(gm => {
          this.gamesManagers = gm;
        });
      }      
    });
   }  



  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.gameServiceConnected.unsubscribe();
    if(!!this.activeGamesSubscription){
      this.activeGamesSubscription.unsubscribe();
    }    
  }
  getPlayer01Score(game:Game):number{
    return game.playMoves.filter(g => g.player == game.player01.userName)
      .map(m => m.score)
      .reduce((a, b) => a + b, 0);
  }
  getPlayer02Score(game:Game):number{
    return game.playMoves.filter(g => g.player == game.player02.userName)
      .map(m => m.score)
      .reduce((a, b) => a + b, 0);
  }
  
  getGameManager(gameId:string ):GameManager{
    return this.gamesManagers?.find(gm => gm.gameId == gameId);
  }
}
