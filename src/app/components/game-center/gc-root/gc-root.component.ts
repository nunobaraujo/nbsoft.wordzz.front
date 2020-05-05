import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/Services/game.service';


@Component({
  selector: 'app-gc-root',
  templateUrl: './gc-root.component.html',
  styleUrls: ['./gc-root.component.scss']
})
export class GcRootComponent implements OnInit,OnDestroy {
  private receivedChallengesSubscription:Subscription
  lastChallengeId:string = null;
  constructor(gameService:GameService) {
    this.receivedChallengesSubscription = gameService.lastReceivedChallenge$.subscribe(challenge =>{
      if(!!challenge  && challenge.id !== this.lastChallengeId){
        this.lastChallengeId = challenge.id;
        alert(`Received new challenge from ${challenge.origin}`);
      } 
    });
   }
  
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.receivedChallengesSubscription.unsubscribe();
  }

}