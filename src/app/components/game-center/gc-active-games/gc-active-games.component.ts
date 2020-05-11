import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { GameHub } from 'src/app/Managers/gameHub';
import { Game } from 'src/app/Models/game';
import { GameManager } from 'src/app/Managers/gameManger';

@Component({
  selector: 'app-gc-active-games',
  templateUrl: './gc-active-games.component.html',
  styleUrls: ['./gc-active-games.component.scss']
})
export class GcActiveGamesComponent implements OnInit, OnDestroy {    
  gamesManagers$ : Observable<GameManager[]>;

  constructor(private gameHub:GameHub) {    
    this.gamesManagers$ = this.gameHub.gameManagers$;
  }  

  ngOnInit(): void {        
  }
  ngOnDestroy(): void {   
    
  }   
  getOpponent(gameId:string):string{
    var player = this.gameHub.getOpponent(gameId);    
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
