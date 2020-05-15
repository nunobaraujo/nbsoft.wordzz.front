import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameHub } from 'src/app/Managers/gameHub';
import { Observable, Subscription } from 'rxjs';
import { GameChallenge } from 'src/app/Models/gameChallenge';
import { faBan, faUserFriends} from '@fortawesome/free-solid-svg-icons';
import { GameChallengeResult } from 'src/app/Models/gameChallengeResult';
import { Router, ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';
import { UserService } from 'src/app/Services/user.service';
import { LexiconService } from 'src/app/Services/lexicon.service';
import { BoardService } from 'src/app/Services/board.service';
import { Lexicon } from 'src/app/Models/lexicon';
import { Board } from 'src/app/Models/board';

@Component({
  selector: 'app-gc-new-game',
  templateUrl: './gc-new-game.component.html',
  styleUrls: ['./gc-new-game.component.scss']
})
export class GcNewGameComponent implements OnInit, OnDestroy {    
  private sentChallengesSubscription: Subscription;
  private sentChallengeResultsSubscription: Subscription;
  private onlineFriendsSubscription: Subscription;
  private settingsSubscription:Subscription;  
  private boardSubscription:Subscription;
  private lexiconSubscription:Subscription;
  
  private sentChallenges$: Observable<GameChallenge[]>  
  private sentChallenges: GameChallenge[];
  private sentChallengesResult$: Observable<GameChallengeResult>
    
  faUserFriends = faUserFriends;  
  faBan = faBan;

  availableLexicons:Lexicon[];
  selectedLexicon:Lexicon;

  availableBoards:Board[];
  selectedBoard:Board;
  
  onlineFriends$: Observable<string[]>;  
  sentChallengesResults: string[]=[];  
  newOpponent:string;
  hasOnlineFriends:boolean = false;
  isSearchingGame:boolean = false;
  gameFound:string = null;
  
  constructor(private router:Router, private gameHub:GameHub,private gameService:GameService, private route: ActivatedRoute, 
    userService:UserService, lexiconService:LexiconService, boardService:BoardService) {         
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

    this.settingsSubscription = userService.settings().subscribe(s => {      
      this.lexiconSubscription = lexiconService.getLexicons().subscribe(ls => {
        this.availableLexicons = ls;
        if (!!s){
          this.selectedLexicon = this.availableLexicons.find(l => l.language.toLowerCase() === s.language.toLowerCase());
        }
      });
      this.boardSubscription = boardService.getBoards().subscribe(bs =>{
        this.availableBoards = bs;
        if (!!s){
          this.selectedBoard = this.availableBoards.find(b => b.id == s.defaultBoard);
        }
      });
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
    this.settingsSubscription.unsubscribe();
    if (!!this.boardSubscription){
      this.boardSubscription.unsubscribe();
    }
    if (!!this.lexiconSubscription){
      this.lexiconSubscription.unsubscribe();
    }
  }


  onStartGame($event: any,friend:string ){
    this.startGame(friend);
  }  
  onCancelChallenge(event: any,friend:string ){
    this.gameService.cancelChallenge(friend);
  }

  private startGame(friend:string){    
    this.gameService.challengeGame(this.selectedLexicon.language,this.selectedBoard.id,friend);
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
