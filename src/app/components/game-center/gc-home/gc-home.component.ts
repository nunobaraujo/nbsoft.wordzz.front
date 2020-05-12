import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { faTrophy,faCrosshairs,faUsers,faSortDown,faThumbsUp,faThumbsDown } from '@fortawesome/free-solid-svg-icons';

import { Game } from 'src/app/Models/game';

import { GameHub } from 'src/app/Managers/gameHub';
import { GameManager } from 'src/app/Managers/gameManger';
import { UserService } from 'src/app/Services/user.service';
import { LexiconService } from 'src/app/Services/lexicon.service';
import { Lexicon } from 'src/app/Models/lexicon';
import { GameResult } from 'src/app/Models/gameResult';
import { MatDialog } from '@angular/material/dialog';
import { GameoverModalComponent } from 'src/app/Dialogs/gameover-modal/gameover-modal.component';
import { BoardService } from 'src/app/Services/board.service';
import { Board } from 'src/app/Models/board';
import { Router } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';
import { GameChallenge } from 'src/app/Models/gameChallenge';


@Component({
  selector: 'app-gc-home',
  templateUrl: './gc-home.component.html',
  styleUrls: ['./gc-home.component.scss']
})
export class GcHomeComponent implements OnInit, OnDestroy {
  faTrophy = faTrophy;
  faCrosshairs = faCrosshairs;
  faUsers = faUsers;
  faSortDown = faSortDown;
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;

  private settingsSubscription:Subscription;  
  private boardSubscription:Subscription;
  private lexiconSubscription:Subscription;
  private searchGameSubscription:Subscription;
  private gameManagerSubscription:Subscription;
  
  availableLexicons:Lexicon[];
  selectedLexicon:Lexicon;

  availableBoards:Board[];
  selectedBoard:Board;
  
  gamesManagers$:Observable<GameManager[]>;
  endedGames$:Observable<GameResult[]>;
  receivedChallenges$:Observable<GameChallenge[]>;

  searchingForGame:boolean = false;
  gameFound:string = null;

  hasGames:boolean = false;
  hasChallenges:boolean = false;

  constructor(private router:Router,
    private userService:UserService, 
    private gameHub: GameHub, 
    private gameService: GameService, 
    lexiconService:LexiconService, 
    boardService:BoardService, 
    public dialog: MatDialog) {  
    
    
    this.settingsSubscription = this.userService.settings().subscribe(s => {      
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
    this.gamesManagers$ = this.gameService.gameManagers$;
    this.endedGames$ = this.gameService.endedGames$;
    this.receivedChallenges$ = this.gameService.receivedChallenges$;

    this.gameManagerSubscription = this.gamesManagers$.subscribe(gm => {
      this.hasGames  = (!!gm && gm.length>0);
    });
    this.receivedChallenges$.subscribe( ch => {
      this.hasChallenges = (!!ch && ch.length>0);
    }) ;


    this. searchGameSubscription = this.gameHub.searchingGame$.subscribe(s => {
      if (s ==="searching"){        
        this.searchingForGame = true;
        this.gameFound = null;
      }
      else {
        this.searchingForGame = false;
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
  }
  ngOnDestroy(): void {
    this.settingsSubscription.unsubscribe();
    if (!!this.lexiconSubscription){
      this.lexiconSubscription.unsubscribe();
    }
    if (!!this.boardSubscription){
      this.boardSubscription.unsubscribe();
    }
    if (!!this.searchGameSubscription){
      this. searchGameSubscription.unsubscribe();
    }
  }
  getPlayer01Score(game:Game):number{
    return game.playMoves.filter(g => g.player == game.player01.userName)
      .map(m => m.score)
      .reduce((a, b) => a + b, 0);
  }
  getPlayer02Score(game:Game):number{
    return game.playMoves.filter(g => g.player == game.player02.userName)
      .map(m => m.score)
      .reduce((a, b) => a + b, 0);
  }

  onSearchGame($event: any){
    console.log('searching for game');
    var language = this.selectedLexicon.language;
    this.gameService.searchGame(language,0);
  }
  onShowGameResult($event: any, gameId:string){
    var result = this.gameService.getGameResult(gameId);

    const dialogRef = this.dialog.open(GameoverModalComponent, {
      width: '600px',      
      data: result
    });

  }

  onAcceptChallenge($event: any, challengeId:string){
    console.log('onAcceptChallenge :>> ', challengeId);
    this.gameService.acceptChallenge(challengeId,true);
  }
  onDeclineChallenge($event: any, challengeId:string){
    console.log('onDeclineChallenge :>> ', challengeId);
    this.gameService.acceptChallenge(challengeId,false);
  }
}
