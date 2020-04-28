import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, setTestabilityGetter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';
import { Observable, from, Subscription, BehaviorSubject } from 'rxjs';
import { GameLog } from 'src/app/Models/gameLog';

@Component({
  selector: 'app-game-center-game',
  templateUrl: './game-center-game.component.html',
  styleUrls: ['./game-center-game.component.scss']
})
export class GameCenterGameComponent implements OnInit, OnDestroy ,AfterViewChecked {
  @ViewChild('gameLog') private myScrollContainer: ElementRef;
  loading = false;
  currentUserName:string;
  gameManager:GameManager;  
  gameManager$:GameManager;  
  gameLogs$: Observable<GameLog[]>;  
  currentPlayer$: Observable<string>;
  routeSubscription:Subscription;
  currentPlayerSubscription:Subscription;
  currentPlayerName:string;
  playLocked:boolean;

  constructor(private route: ActivatedRoute, private gameService:GameService, cdr: ChangeDetectorRef ) {    
    this.currentUserName = this.gameService.currentUser.username;
    this.routeSubscription = this.route.data
    .subscribe((data) => {
      this.loading = true;
      this.gameManager = this.gameService.getManager(data.game.id);           
      this.gameLogs$ = this.gameManager.gameLog$;             
      this.currentPlayer$ =this.gameManager.currentPlayer$;
      this.currentPlayerSubscription = this.currentPlayer$
        .subscribe(p =>{ 
          this.playLocked = p !== this.currentUserName;
          this.currentPlayerName = p;
          setTimeout(() => {      
            this.loading = false;      
          });          
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
  }
  
  play():void{
    this.playLocked = true;
    this.gameManager.play();
    this.playLocked = false;
  }
  pass():void{

  }
  getLogClass(log:GameLog):string{
    if(log.sender == this.currentUserName){
      return "game-container-log-player";
    }
    return "game-container-log-opponent"
  }
  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

}
