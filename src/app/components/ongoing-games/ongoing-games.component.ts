import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameHub } from 'src/app/Managers/gameHub';
import { Observable, Subscription } from 'rxjs';
import { Game } from 'src/app/Models/game';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ongoing-games',
  templateUrl: './ongoing-games.component.html',
  styleUrls: ['./ongoing-games.component.scss']
})
export class OngoingGamesComponent implements OnInit, OnDestroy {
  faTrophy = faTrophy;
  games$: Observable<Game[]>;
  games:Game[];
  private gameServiceConnectedSubscription:Subscription;
  private gameSubscription:Subscription;    
  
  constructor(private router:Router,public gameHub:GameHub) {
    
   }
  
  ngOnInit(): void {
    this.gameServiceConnectedSubscription = this.gameHub.isConnected$.subscribe(connected => {
      if (connected){
        this.games$ = this.gameHub.getActiveGames();
        this.gameSubscription = this.games$.subscribe(g =>{ 
          this.games = g;          
        });
      }
      else{
        if (!!this.gameSubscription){
          this.gameSubscription.unsubscribe();
        }
      }      
    });
    
  }
  ngOnDestroy(): void {
    this.gameServiceConnectedSubscription.unsubscribe();
    if (!!this.gameSubscription){
      this.gameSubscription.unsubscribe();
    }
  }

  gotoGame($event, gameId:string){    
    let gameUrl:string = "/game-center/"+gameId;
        setTimeout(() => {
          this.router.navigateByUrl(gameUrl);  
        }, 100);
  }

  getOpponent(gameId:string):string{
    var player = this.gameHub.getOpponent(gameId);
    if (!player){
      return "";
    }
    if (player.firstName !== ""){
      return `${player.firstName} ${player.lastName}`
    }
    else{
      return player.userName;
    }
  }

}
