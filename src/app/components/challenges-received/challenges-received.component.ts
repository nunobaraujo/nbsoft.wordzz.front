import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { faThumbsUp,faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { GameHub } from 'src/app/Managers/gameHub';
import { GameChallenge } from 'src/app/Models/gameChallenge';

@Component({
  selector: 'app-challenges-received',
  templateUrl: './challenges-received.component.html',
  styleUrls: ['./challenges-received.component.scss']
})


export class ChallengesReceivedComponent implements OnInit,OnDestroy {
  faThumbsUp=faThumbsUp;
  faThumbsDown = faThumbsDown;
  receivedChallengesSubscription:Subscription;
  hasChallenges:boolean;
  receivedChallenges$:Observable<GameChallenge[]>;
  
  
  constructor(private router:Router, public gameHub:GameHub) {
    this.receivedChallenges$ = gameHub.receivedChallenges$
    this.receivedChallengesSubscription = this.receivedChallenges$.subscribe(c =>{
      if (!!c ){
        this.hasChallenges = c.length >0;
      }
      else{
        this.hasChallenges = false;
      }
      
    });
   }
  

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.receivedChallengesSubscription.unsubscribe();
  }


  acceptChallenge($event: any, challengeId:string)
  {
    this.gameHub.acceptChallenge(challengeId, true).subscribe(gameId => {    
      if (!!gameId){
        let gameUrl:string = "/game-center/"+gameId;
        setTimeout(() => {
          this.router.navigateByUrl(gameUrl);
        }, 100);
      }      
    });    
  }
  refuseChallenge($event: any, challengeId:string){
    this.gameHub.acceptChallenge(challengeId, false);
  }

}
