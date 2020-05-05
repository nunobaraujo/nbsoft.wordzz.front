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
export class GcActiveGamesComponent implements OnInit, OnDestroy {  
  private gameServiceConnected:Subscription;  
  private gameSubscription:Subscription;    
  games$: Observable<Game[]>;
  games: Game[];

  constructor(private gameService:GameService) {
    console.log('CONSTR  Active Games');
  }  

  ngOnInit(): void {        
    console.log('INIT  Active Games');
    this.refreshData();
  }
  ngOnDestroy(): void {
    this.gameServiceConnected.unsubscribe();
    if(!!this.gameSubscription){
      this.gameSubscription.unsubscribe();
    }
    
  }   
  getOpponent(gameId:string):string{
    var player = this.gameService.getOpponent(gameId);
    if (!!player ){
      if (player.firstName !== ""){
        return `${player.firstName} ${player.lastName}`
      }
      else{
        return player.userName;
      }
    }
    else{
      this.refreshData();
    }
    
  }
  private refreshData(){
    if (!!this.gameServiceConnected){
      this.gameServiceConnected.unsubscribe();
    }
    this.gameServiceConnected = this.gameService.isConnected$.subscribe(connected =>    {
      if (connected){        
        console.log('Get Active Games');
        setTimeout(() => {
          this.games$ = this.gameService.getActiveGames();
          this.gameSubscription = this.games$.subscribe(g =>{ 
            this.games = g;
          });  
        });
      }      
    });    
  }
}
