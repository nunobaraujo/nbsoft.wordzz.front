import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameHub } from 'src/app/Managers/gameHub';
import { GameManager } from 'src/app/Managers/gameManger';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { GameLog } from 'src/app/Models/gameLog';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { GameoverModalComponent } from 'src/app/Dialogs/gameover-modal/gameover-modal.component';
import { GameResult } from 'src/app/Models/gameResult';

@Component({
  selector: 'app-gc-game',
  templateUrl: './gc-game.component.html',
  styleUrls: ['./gc-game.component.scss']
})
export class GcGameComponent implements OnInit, OnDestroy ,AfterViewChecked {
  @ViewChild('gameLog') private myScrollContainer: ElementRef;
  faTimesCircle = faTimesCircle;
  loading = false;
  currentUserName:string;
  gameManager:GameManager;  
  
  currentPlayerSubscription:Subscription;
  onlineOpponentsSubscription:Subscription;
  routeSubscription:Subscription;
  gameOverSubscription:Subscription;

  gameLogs$: Observable<GameLog[]>;  
  
  currentPlayerName:string;
  playLocked:boolean;

  isOpponentOnline = false;
  private _status = new BehaviorSubject<string>(null);
  status$ = this._status.asObservable();

  constructor(private route: ActivatedRoute, private gameHub:GameHub, router:Router ,public dialog: MatDialog) {    
    this.currentUserName = this.gameHub.currentUser.username;
    console.log('this.gameHub :>> ', this.gameHub);
    
    if(!!this.routeSubscription){
      this.routeSubscription.unsubscribe();  
    }
    this.routeSubscription = this.route.data
    .subscribe((data) => {
      this.loading = true;
      console.log('data.game.id :>> ', data.game.id);
      this.gameManager = this.gameHub.getManager(data.game.id);   
      console.log('this.gameManager :>> ', this.gameManager);
      this.gameLogs$ = this.gameManager.gameLog$;         
      if (!!this.gameOverSubscription){
        this.gameOverSubscription.unsubscribe();
      }
      this.gameOverSubscription = this.gameManager.gameEnded$.subscribe(e =>{
        if(!!e){
          this.onGameOver(e);
          this.loading = true;
          router.navigate(['/game-center']);
        }
      });
      
      if(!!this.currentPlayerSubscription){
        this.currentPlayerSubscription.unsubscribe();
      }
      this.currentPlayerSubscription = this.gameManager.currentPlayer$.subscribe(p =>{ 
        this.playLocked = p !== this.currentUserName;
        this.currentPlayerName = p;
        setTimeout(() => {      
          this.loading = false;      
        });          
      });      
      if(!!this.onlineOpponentsSubscription){
        this.onlineOpponentsSubscription.unsubscribe();
      }
      this.onlineOpponentsSubscription = this.gameHub.onlineOpponents$.subscribe(opponent =>{
        this.isOpponentOnline = opponent.findIndex(f => this.gameManager.getOpponent().userName ) !== -1;        
      }); 
    });     
  }      
  ngOnInit(): void {    
    this.scrollToBottom();
    
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  ngOnDestroy(): void {
    this.currentPlayerSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.gameOverSubscription.unsubscribe();
    this.onlineOpponentsSubscription.unsubscribe();
  }
  
  onPlay():void{    
    this._status.next("Waiting...");
    this.playLocked = true;
    this.gameManager.play().then(res =>{ 
      console.log('res :>> ', res);      
      this._status.next(res);
      this.playLocked = false
      setTimeout(() => {
        this._status.next("");
      }, 8000);
    });
    
  }
  onPass():void{    
    var r = confirm("Are you sure you want to pass your turn?");
    if (r == true) {
      this.gameManager.pass();    
    }    
  }
  onForfeit():void{
    var r = confirm("Forfeiting a game counts as a loss.\nAre you sure you want to forfeit this game?");
    if (r == true) {
      this.gameManager.forfeit();    
    }    

  }

  getLogClass(log:GameLog):string{
    if(log.sender == this.currentUserName){
      return "game-container-log-player";
    }
    return "game-container-log-opponent"
  }
  getLogLine(log: GameLog){
    if (log.score === 0)
    {
      return `${log.sender} passed.`;
    }
    else
    {
      return `${log.sender} scored ${log.score}.`;
    }
     
  }
  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }
  getPlayerUserName():string{
    if (!this.gameManager.player){
      return "";
    }
    return this.gameManager.player.userName;
  }
   getPlayerFullName():string{
    if (!this.gameManager.player){
      return "";
    }
    if(!!this.gameManager.player.firstName ){
      return `${this.gameManager.player.firstName} ${this.gameManager.player.lastName}`
    }
    return this.gameManager.player.userName;
  }
  getOpponentUserName():string{
    if (!this.gameManager.player){
      return "";
    }    
    return this.gameManager.opponent.userName;
  }

   getOpponentFullName():string{
    if (!this.gameManager.player){
      return "";
    }
    if(!!this.gameManager.opponent.firstName ){
      return `${this.gameManager.opponent.firstName} ${this.gameManager.opponent.lastName}`
    }
    return this.gameManager.opponent.userName;
  }

  onGameOver(result:GameResult){
    const dialogRef = this.dialog.open(GameoverModalComponent, {
      width: '600px',      
      data: result
    });
  }
  
}
