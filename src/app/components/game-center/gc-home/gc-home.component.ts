import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { faTrophy,faCrosshairs } from '@fortawesome/free-solid-svg-icons';

import { Game } from 'src/app/Models/game';

import { GameService } from 'src/app/Services/game.service';


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
  constructor(private gameService: GameService) {    
    this.gameServiceConnected = this.gameService.isConnected$.subscribe(connected =>    {
      if (connected){        
        this.games$ = this.gameService.getActiveGames();
        this.activeGamesSubscription = this.games$.subscribe(g =>{ 
          this.games = g;
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

  getIsMyTurn(game:Game):string{    
    if (game.currentPlayer == this.gameService.currentUser.username){
      return "text-danger";
    }
    else{
      return "text-success";
    }


  }
}
