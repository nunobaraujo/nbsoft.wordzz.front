import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';
import { Observable, Subscription, from } from 'rxjs';
import { GameLog } from 'src/app/Models/gameLog';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

  constructor(private route: ActivatedRoute, private gameService:GameService, router:Router ) {    
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
          alert(e);
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
    this.playLocked = true;
    this.gameManager.play().then(() => this.playLocked = false);
    
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

   getPlayerName():string{
    if (!this.gameManager.player){
      return "";
    }
    if(!!this.gameManager.player.firstName ){
      return `${this.gameManager.player.firstName} ${this.gameManager.player.lastName} (${this.gameManager.player.userName})`
    }
    return this.gameManager.player.userName;
  }
   getOpponentName():string{
    if (!this.gameManager.player){
      return "";
    }
    if(!!this.gameManager.opponent.firstName ){
      return `${this.gameManager.opponent.firstName} ${this.gameManager.opponent.lastName} (${this.gameManager.opponent.userName})`
    }
    return this.gameManager.opponent.userName;
  }

  
}
