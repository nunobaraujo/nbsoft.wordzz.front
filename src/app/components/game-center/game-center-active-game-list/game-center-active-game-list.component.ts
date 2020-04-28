import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

import { GameService } from 'src/app/Services/game.service';
import { AuthenticationService } from 'src/app/Services/authentication.service';

import { Game } from 'src/app/Models/game';
import { User } from 'src/app/Models/user';

@Component({
  selector: 'app-game-center-active-game-list',
  templateUrl: './game-center-active-game-list.component.html',
  styleUrls: ['./game-center-active-game-list.component.scss']
})
export class GameCenterActiveGameListComponent implements OnInit, OnDestroy{  
  private gameServiceConnected:Subscription;  
  private gameSubscription:Subscription;  
  loading:boolean = false;  
  games$: Observable<Game[]>;
  games: Game[];

  constructor(private gameService:GameService) {
    
  }  

  ngOnInit(): void {    
    this.loading = true;    
    this.gameServiceConnected = this.gameService.isConnected$.subscribe(connected =>    {
      if (connected){        
        this.games$ = this.gameService.getActiveGames();
        this.gameSubscription = this.games$.subscribe(g =>{ 
          this.games = g;
          this.loading = false;
        });
        
      }
      else
      {
        this.loading = true;
      }
    });
    /*
    setTimeout(() => {      
      this.games$ = this.gameService.getActiveGames();
      this.gameSubscription = this.games$.subscribe(g => this.games = g);
      this.loading = false;
    },1000);
    */
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
