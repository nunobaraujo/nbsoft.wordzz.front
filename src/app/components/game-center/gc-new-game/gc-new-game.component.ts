import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { faTrophy} from '@fortawesome/free-solid-svg-icons';
import { GameChallengeResult } from 'src/app/Models/gameChallengeResult';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gc-new-game',
  templateUrl: './gc-new-game.component.html',
  styleUrls: ['./gc-new-game.component.scss']
})
export class GcNewGameComponent implements OnInit, OnDestroy {    
  private sentChallenges$: Observable<GameChallenge[]>
  private sentChallengesSubscription: Subscription;
  private sentChallenges: GameChallenge[];
  private sentChallengesResult$: Observable<GameChallengeResult>
  private sentChallengeResultsSubscription: Subscription;
  faTrophy = faTrophy;
  onlineFriends$: Observable<string[]>;  
  sentChallengesResults: string[]=[];
  isWaiting: string[]=[];
  
  constructor(private router:Router, private gameService:GameService) {     
    this.onlineFriends$ = this.gameService.onlineFriends$;
    this.sentChallenges$ = this.gameService.sentChallenges$;
    this.sentChallengesResult$ = this.gameService.sentChallengesResult$;
    this.sentChallengesSubscription = this.sentChallenges$.subscribe(chall =>{      
      this.sentChallenges = chall;
    });

    this.sentChallengeResultsSubscription = this.sentChallengesResult$.subscribe(cres =>{
      if (!!cres){
        var waitingIndex = this.isWaiting.findIndex(u => u === cres.challenge.challenger);
        if (waitingIndex !== -1){
          this.isWaiting.splice(waitingIndex,1);
        }

        if (cres.accepted){
          this.sentChallengesResults.push(cres.challenge.challenger + " accepted your challenge. Game starting in 3 seconds...");
          setTimeout(() =>{
            let gameUrl:string = "/game-center/"+cres.gameId;
            this.router.navigateByUrl(gameUrl);
          }          
          ,3000);
        }
        else{
          this.sentChallengesResults.push(cres.challenge.challenger + " refused your challenge.");
        }
      }        
    });
    
  } 
  ngOnInit(): void {
    
  }
  ngOnDestroy(): void {
    this.sentChallengesSubscription.unsubscribe();
    this.sentChallengeResultsSubscription.unsubscribe();
  }


  startGame($event: any,friend:string ){
    this.isWaiting.push(friend);
    this.gameService.challengeGame('en-us',friend,15).then(res => {
      console.log('New Challenge :', res);
    });
  }
  startSoloGame($event: any){
    console.log('solo game :', $event);
    this.gameService.newSoloGame()
  }

  hasChallenge(friendName:string):boolean
  {    
    var waitingIndex = this.isWaiting.findIndex(u => u === friendName);
    if (waitingIndex !== -1){
      return true
    }

    if (!!this.sentChallenges){
      let isChallenge = this.sentChallenges.find((c) => c.challenger===friendName);            
      return  !!isChallenge;
    }
    return false;
  }

}
