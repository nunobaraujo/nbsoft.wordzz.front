import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { faThumbsUp,faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import { GameChallenge } from 'src/app/Models/gameChallenge';
import { GameService } from 'src/app/Services/game.service';

@Component({  
  selector: 'app-gc-challenges',
  templateUrl: './gc-challenges.component.html',
  styleUrls: ['./gc-challenges.component.scss']
})
export class GcChallengesComponent implements OnInit, OnDestroy {
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  private receivedChallengesSubscription:Subscription;  
  receivedChallenges$:Observable<GameChallenge[]>  
  receivedChallenges:GameChallenge[];  

  private sentChallengesSubscription:Subscription;
  sentChallenges$:Observable<GameChallenge[]>  
  sentChallenges:GameChallenge[];  

  constructor(private router:Router, private gameService:GameService) {
    this.receivedChallenges$ = gameService.receivedChallenges$;
    this.receivedChallengesSubscription = this.receivedChallenges$.subscribe(c => this.receivedChallenges = c);
    
    this.sentChallenges$ = gameService.sentChallenges$;
    this.sentChallengesSubscription = this.sentChallenges$.subscribe(c => this.sentChallenges = c);
   }
  
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.receivedChallengesSubscription.unsubscribe();
    this.sentChallengesSubscription.unsubscribe();
  }

  hasChallenges():boolean{
    if (!this.receivedChallenges || this.receivedChallenges.length<1){
      return false;
    }
    return true;    
  }
  hasSentChallenges():boolean{
    if (!this.sentChallenges || this.sentChallenges.length<1){
      return false;
    }
    return true;    
  }

  acceptChallenge($event: any, challengeId:string)
  {
    this.gameService.acceptChallenge(challengeId, true).subscribe(gameId => {    
      if (!!gameId){
        let gameUrl:string = "/game-center/"+gameId;
        setTimeout(() => {
          this.router.navigateByUrl(gameUrl);  
        }, 1000);        
      }      
    });    
  }
  refuseChallenge($event: any, challengeId:string){
    this.gameService.acceptChallenge(challengeId, false);
  }

}
