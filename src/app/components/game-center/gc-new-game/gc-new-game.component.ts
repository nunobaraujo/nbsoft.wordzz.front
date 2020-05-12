import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameHub } from 'src/app/Managers/gameHub';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { faTrophy, faUserFriends, faSearch, faBan} from '@fortawesome/free-solid-svg-icons';
import { GameChallengeResult } from 'src/app/Models/gameChallengeResult';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';

@Component({
  selector: 'app-gc-new-game',
  templateUrl: './gc-new-game.component.html',
  styleUrls: ['./gc-new-game.component.scss']
})
export class GcNewGameComponent implements OnInit, OnDestroy {    
  private sentChallengesSubscription: Subscription;
  private sentChallengeResultsSubscription: Subscription;
  private onlineFriendsSubscription: Subscription;
  
  private sentChallenges$: Observable<GameChallenge[]>  
  private sentChallenges: GameChallenge[];
  private sentChallengesResult$: Observable<GameChallengeResult>
  
  faTrophy = faTrophy;
  faUserFriends = faUserFriends;
  faSearch = faSearch;
  faBan = faBan;
  
  onlineFriends$: Observable<string[]>;  
  sentChallengesResults: string[]=[];  
  newOpponent:string;
  hasOnlineFriends:boolean = false;
  isSearchingGame:boolean = false;
  gameFound:string = null;
  
  constructor(private router:Router, private gameHub:GameHub,private gameService:GameService, private route: ActivatedRoute) {         
    this.onlineFriends$ = this.gameService.onlineFriends$;
    this.onlineFriendsSubscription = this.onlineFriends$.subscribe(f => this.hasOnlineFriends = f.length > 0);
    
    this.sentChallenges$ = this.gameService.sentChallenges$;    
    this.sentChallengesSubscription = this.sentChallenges$.subscribe(chall => this.sentChallenges = chall);

    this.sentChallengesResult$ = this.gameService.challengeResults$;
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
    this.onlineFriendsSubscription.unsubscribe();
  }


  onStartGame($event: any,friend:string ){
    this.startGame(friend);
  }  
  onCancelChallenge(event: any,friend:string ){
    this.gameService.cancelChallenge(friend);
  }

  private startGame(friend:string){    
    this.gameService.challengeGame('en-US',0,friend);
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
