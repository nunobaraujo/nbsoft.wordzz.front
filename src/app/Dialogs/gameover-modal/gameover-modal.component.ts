import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameOver } from 'src/app/Models/gameOver';

import { AuthenticationService } from 'src/app/Services/authentication.service';
import { FinishReason } from 'src/app/Enums/finishReason';




@Component({
  selector: 'app-gameover-modal',
  templateUrl: './gameover-modal.component.html',
  styleUrls: ['./gameover-modal.component.scss']
})
export class GameoverModalComponent implements OnInit {

  headText: string;
  gameClass: string;
  finishReason: string;

  constructor(public authService:AuthenticationService, public dialogRef: MatDialogRef<GameoverModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GameOver) { 
      console.log('data :>> ', data);
      if (data.result.winner == authService.currentUserValue.username){
        this.headText = "WINNER";
        this.gameClass = "wz-go-title-win";        
      }
      else{
        this.headText = "YOU LOSE";
        this.gameClass = "wz-go-title-lose";
      }
      var looser = data.result.winner == data.game.player01.userName ? data.game.player02.userName : data.game.player01.userName;

      this.finishReason = data.result.reason == FinishReason.Forfeit ? `Player ${looser} forfeited` :"Game Over";

    }

  ngOnInit(): void {
  }


  public close(){
    this.dialogRef.close();
  }

}
