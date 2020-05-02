import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { faThumbsUp,faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { GameService } from 'src/app/Services/game.service';

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

  
  constructor(private router:Router, public gameService:GameService) {
    this.receivedChallengesSubscription = gameService.receivedChallenges$.subscribe(c =>{
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
    this.gameService.acceptChallenge(challengeId, true).subscribe(gameId => {    
      if (!!gameId){
        let gameUrl:string = "/game-center/"+gameId;
        setTimeout(() => {
          this.router.navigateByUrl(gameUrl);
        }, 100);
      }      
    });    
  }
  refuseChallenge($event: any, challengeId:string){
    this.gameService.acceptChallenge(challengeId, false);
  }

}
