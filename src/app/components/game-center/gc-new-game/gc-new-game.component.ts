import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { faTrophy} from '@fortawesome/free-solid-svg-icons';
import { GameChallengeResult } from 'src/app/Models/gameChallengeResult';
import { Router, ActivatedRoute } from '@angular/router';

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
  //isWaiting: string[]=[];
  newOpponent:string;
  
  constructor(private router:Router, private gameService:GameService, private route: ActivatedRoute) {         
    this.onlineFriends$ = this.gameService.onlineFriends$;
    this.sentChallenges$ = this.gameService.sentChallenges$;
    this.sentChallengesResult$ = this.gameService.sentChallengesResult$;
    this.sentChallengesSubscription = this.sentChallenges$.subscribe(chall =>{      
      this.sentChallenges = chall;
    });

    this.sentChallengeResultsSubscription = this.sentChallengesResult$.subscribe(cres =>{
      if (!!cres){        

        if (cres.accepted){
          this.sentChallengesResults.push(cres.challenge.destination + " accepted your challenge. Game starting in 3 seconds...");
          setTimeout(() =>{
            let gameUrl:string = "/game-center/"+cres.gameId;
            this.router.navigateByUrl(gameUrl);
          }          
          ,3000);
        }
        else{
          this.sentChallengesResults.push(cres.challenge.destination + " refused your challenge.");
        }
      }        
    });
    
  } 
  ngOnInit(): void {   
    this.newOpponent = this.route.snapshot.paramMap.get('id');
    if (!!this.newOpponent) {
      this.startGame(this.newOpponent)
    }
  }
  ngOnDestroy(): void {
    this.sentChallengesSubscription.unsubscribe();
    this.sentChallengeResultsSubscription.unsubscribe();
  }


  onStartGame($event: any,friend:string ){
    this.startGame(friend);
  }
  onStartSoloGame($event: any){    
    this.gameService.newSoloGame()
  }

  private startGame(friend:string){    
    this.gameService.challengeGame('en-us',friend,15).then(res => {
      console.log('Sent New Challenge :', res);
    });
  }
  private startSoloGame($event: any){    
    this.gameService.newSoloGame()
  }

  hasChallenge(friendName:string):boolean
  { 
    if (!!this.sentChallenges){
      let isChallenge = this.sentChallenges.find((c) => c.destination===friendName);            
      return  !!isChallenge;
    }
    return false;
  }

}
