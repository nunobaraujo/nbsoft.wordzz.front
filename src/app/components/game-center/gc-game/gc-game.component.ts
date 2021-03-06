import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameHub } from 'src/app/Managers/gameHub';
import { GameManager } from 'src/app/Managers/gameManger';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { GameLog } from 'src/app/Models/gameLog';
import { faTimesCircle,faAlignJustify } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { GameoverModalComponent } from 'src/app/Dialogs/gameover-modal/gameover-modal.component';
import { GameResult } from 'src/app/Models/gameResult';
import { GameService } from 'src/app/Services/game.service';

@Component({
  selector: 'app-gc-game',
  templateUrl: './gc-game.component.html',
  styleUrls: ['./gc-game.component.scss']
})
export class GcGameComponent implements OnInit, OnDestroy ,AfterViewChecked {
  @ViewChild('gameLog') private myScrollContainer: ElementRef;
  faTimesCircle = faTimesCircle;
  faAlignJustify = faAlignJustify;
  loading = false;
  currentUserName:string;
  gameManager:GameManager;  
  
  currentPlayerSubscription:Subscription;
  onlineOpponentsSubscription:Subscription;
  routeSubscription:Subscription;
  gameOverSubscription:Subscription;
  lastOponentMoveSubscription:Subscription;

  gameLogs$: Observable<GameLog[]>;  
  
  currentPlayerName:string;
  playLocked:boolean;

  isOpponentOnline = false;
  activePlayer:string = "";
  private _status = new BehaviorSubject<string>(null);
  status$ = this._status.asObservable();

  constructor(private route: ActivatedRoute, private gameHub:GameHub, private gameService:GameService, router:Router ,public dialog: MatDialog) {    
    this.currentUserName = this.gameService.currentUser.username;    
    if(!!this.routeSubscription){
      this.routeSubscription.unsubscribe();  
    }
    this.routeSubscription = this.route.data
    .subscribe((data) => {
      this.loading = true;      
      this.gameManager = this.gameService.getManager(data.game.id);      
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
      this.onlineOpponentsSubscription = this.gameService.onlineOpponents$.subscribe(opponent =>{
        this.isOpponentOnline = opponent.findIndex(f => this.gameManager.getOpponent().userName ) !== -1;        
      }); 

      if (!!this.lastOponentMoveSubscription){
        this.lastOponentMoveSubscription.unsubscribe();
      }
      this.lastOponentMoveSubscription = this.gameManager.lastOpponentMove$.subscribe(p =>{
        if (!!p){
          var words:string[] = [];
          console.log('p :>> ', p);
          p.words.forEach(w => {
            words.push(this.gameManager.getWord(w));
          });        
          var text =`${this.getOpponentFullName()} scored ${p.score} points: [${words.join(', ')}]`;
          this.setStatusText(text,10000);
        }
      });      

      this.gameManager.currentPlayer$.subscribe(c => {
        this.activePlayer = c;
      });

    });     
  }      

  getPlayerUserClass():string{
    return this.activePlayer == this.getPlayerUserName() ? "active-player" :"inactive-player" 
  }
  getOpponentUserClass():string{
    if (!this.isOpponentOnline){
      return "offline-player";
    }
    return this.activePlayer == this.getOpponentUserName() ? "active-player" :"inactive-player" 
    
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
    this.lastOponentMoveSubscription.unsubscribe();
  }
  
  onPlay():void{    
    this.play()
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
  private async play(){
    this._status.next("Waiting...");
    this.playLocked = true;
    var res = await this.gameManager.play();
    this.playLocked = false
    if(res.moveResult == "OK")
    {
      var words:string[] = [];
      res.playMove.words.forEach(w => {
        words.push(this.gameManager.getWord(w));
      });        
      var text =`Scored ${res.playMove.score} points: [${words.join(', ')}]`;
      this.setStatusText(text,10000);
    }
    else{
      this.setStatusText(res.moveResult,5000);
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
  
  isLogPopped:boolean = false;
  logContainerClicked(event)
  {
    var target = event.target || event.srcElement || event.currentTarget;    
    var idAttr = target.attributes.id;
    if (!!idAttr){
      var value = idAttr.nodeValue;
      if (value == "gameLogContainer"){
        console.log('calue :>> ', value);
        this.isLogPopped = false;
      }
    }
  }
  onPopLogs(event){
    this.isLogPopped = true;
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

  setStatusText(text:string,duration:number ){
    console.log('Status :>> ', text);
    this._status.next(text);      
      setTimeout(() => {
        this._status.next("");
      }, duration);

  }
  onGameOver(result:GameResult){
    const dialogRef = this.dialog.open(GameoverModalComponent, {
      width: '600px',      
      data: result
    });
  }
  
}
