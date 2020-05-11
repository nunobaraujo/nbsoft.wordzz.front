import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameHub } from 'src/app/Managers/gameHub';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { faTrophy, faUserFriends, faSearch} from '@fortawesome/free-solid-svg-icons';
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
  faUserFriends = faUserFriends;
  faSearch = faSearch;
  
  onlineFriends$: Observable<string[]>;  
  sentChallengesResults: string[]=[];  
  newOpponent:string;
  isSearchingGame:boolean = false;
  gameFound:string = null;
  
  constructor(private router:Router, private gameHub:GameHub, private route: ActivatedRoute) {         
    this.onlineFriends$ = this.gameHub.onlineFriends$;
    this.sentChallenges$ = this.gameHub.sentChallenges$;
    this.sentChallengesResult$ = this.gameHub.challengeResult$;
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

    this.gameHub.searchingGame$.subscribe(s => {
      if (s ==="searching"){
        this.isSearchingGame = true;
        this.gameFound = null;
      }
      else {
        this.isSearchingGame = false;
        if (!!s && s !== ""){          
          this.gameFound = "Game match found, starting game in a few seconds...";
          setTimeout(() => {
            let gameUrl:string = "/game-center/"+s;            
            this.router.navigateByUrl(gameUrl);
          }, 5000);
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
    this.startSoloGame();
  }
  onSearchGame($event: any){
    this.searchGame("en-US",0);    
  }

  private startGame(friend:string){    
    this.gameHub.challengeGame('en-US',0,friend).then(res => {
      console.log('Sent New Challenge :', res);
    });
  }
  private startSoloGame(){    
    this.gameHub.newSoloGame()
  }
  private searchGame(language:string, boardId:number ){    
    this.gameHub.searchGame(language,boardId);
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
