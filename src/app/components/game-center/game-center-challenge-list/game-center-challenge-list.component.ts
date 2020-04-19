import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';

@Component({
  selector: 'app-game-center-challenge-list',
  templateUrl: './game-center-challenge-list.component.html',
  styleUrls: ['./game-center-challenge-list.component.scss']
})
export class GameCenterChallengeListComponent implements OnInit, OnDestroy {
  private subscription:Subscription;
  challengeList$:Observable<GameChallenge[]>  
  constructor(private gameService:GameService) {
    this.challengeList$ = gameService.receivedChallenges;
    this.subscription = this.challengeList$.subscribe();
    
   }
  
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  acceptChallenge($event: any, challengeId:string)
  {
    this.gameService.acceptChallenge(challengeId, true);
    // go to game
  }
  refuseChallenge($event: any, challengeId:string){
    this.gameService.acceptChallenge(challengeId, false);
  }

}
