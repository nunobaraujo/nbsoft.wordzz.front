import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable, Subscription } from 'rxjs';
import { Game } from 'src/app/Models/game';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-ongoing-games',
  templateUrl: './ongoing-games.component.html',
  styleUrls: ['./ongoing-games.component.scss']
})
export class OngoingGamesComponent implements OnInit, OnDestroy {
  faTrophy = faTrophy;
  games$: Observable<Game[]>;
  games:Game[];
  private gameSubscription:Subscription;    
  
  constructor(public gameService:GameService) {
    
   }
  
  ngOnInit(): void {
    this.games$ = this.gameService.getActiveGames();
    this.gameSubscription = this.games$.subscribe(g =>{ 
      this.games = g;
    });
  }
  ngOnDestroy(): void {
    if (!!this.gameSubscription){
      this.gameSubscription.unsubscribe();
    }
  }

  gotoGame($event, gameId:string){
    console.log('gameId :>> ', gameId);
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
