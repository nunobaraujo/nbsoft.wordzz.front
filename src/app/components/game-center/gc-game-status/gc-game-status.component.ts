import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { GameManager } from 'src/app/Managers/gameManger';

@Component({
  selector: 'app-gc-game-status',
  templateUrl: './gc-game-status.component.html',
  styleUrls: ['./gc-game-status.component.scss']
})
export class GcGameStatusComponent implements OnInit, AfterViewInit {
  @Input('gameManager') gameManager: GameManager;
  turnClass: string = "text-danger";
  constructor() {    
   }  

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    console.log('this.gameManager :>> ', this.gameManager.gameId);
    setTimeout(() => {
      this.gameManager.currentPlayer$.subscribe( c => {
        if (c == this.gameManager.currentUser.username){
          this.turnClass = "text-danger";
        }
        else
        {
          this.turnClass = "text-success";
        }
      });  
    });
  }
  public getPlayer(){
    if (this.gameManager.game?.currentPlayer == this.gameManager.currentUser.username)
    {
      return `${this.gameManager.game.currentPlayer} (YOU)`;
    }
    return this.gameManager.game?.currentPlayer;
  }
}
