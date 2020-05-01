import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gc-challenges',
  templateUrl: './gc-challenges.component.html',
  styleUrls: ['./gc-challenges.component.scss']
})
export class GcChallengesComponent implements OnInit, OnDestroy {
  private subscription:Subscription;
  challengeList$:Observable<GameChallenge[]>  
  challengeList:GameChallenge[];  
  constructor(private router:Router, private gameService:GameService) {
    this.challengeList$ = gameService.receivedChallenges$;
    this.subscription = this.challengeList$.subscribe(c => this.challengeList = c);
    
   }
  
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  acceptChallenge($event: any, challengeId:string)
  {
    this.gameService.acceptChallenge(challengeId, true).subscribe(gameId => {    
      if (!!gameId){
        let gameUrl:string = "/game-center/"+gameId;
        this.router.navigateByUrl(gameUrl);
      }      
    });    
  }
  refuseChallenge($event: any, challengeId:string){
    this.gameService.acceptChallenge(challengeId, false);
  }

}
