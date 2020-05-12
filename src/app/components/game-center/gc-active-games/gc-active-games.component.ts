import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { GameManager } from 'src/app/Managers/gameManger';
import { GameService } from 'src/app/Services/game.service';

@Component({
  selector: 'app-gc-active-games',
  templateUrl: './gc-active-games.component.html',
  styleUrls: ['./gc-active-games.component.scss']
})
export class GcActiveGamesComponent implements OnInit, OnDestroy {    
  gamesManagers$ : Observable<GameManager[]>;

  constructor(private gameService:GameService) {    
    this.gamesManagers$ = this.gameService.gameManagers$;
  }  

  ngOnInit(): void {        
  }
  ngOnDestroy(): void {   
    
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
      //this.refreshData();
    }
    
  } 
}
