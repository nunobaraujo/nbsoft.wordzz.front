import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { GameService } from 'src/app/Services/game.service';
import { Game } from 'src/app/Models/game';

@Component({
  selector: 'app-gc-active-games',
  templateUrl: './gc-active-games.component.html',
  styleUrls: ['./gc-active-games.component.scss']
})
export class GcActiveGamesComponent implements OnInit, OnDestroy{  
  private gameServiceConnected:Subscription;  
  private gameSubscription:Subscription;    
  games$: Observable<Game[]>;
  games: Game[];

  constructor(private gameService:GameService) {
    
  }  

  ngOnInit(): void {        
    this.gameServiceConnected = this.gameService.isConnected$.subscribe(connected =>    {
      if (connected){        
        this.games$ = this.gameService.getActiveGames();
        this.gameSubscription = this.games$.subscribe(g =>{ 
          this.games = g;
        });
        
      }      
    });    
  }
  ngOnDestroy(): void {
    this.gameServiceConnected.unsubscribe();
    if(!!this.gameSubscription){
      this.gameSubscription.unsubscribe();
    }
    
  }   
  getOpponent(gameId:string):string{
    var player = this.gameService.getOpponent(gameId);
    if (player.firstName !== ""){
      return `${player.firstName} ${player.lastName}`
    }
    else{
      return player.userName;
    }
  }
}
