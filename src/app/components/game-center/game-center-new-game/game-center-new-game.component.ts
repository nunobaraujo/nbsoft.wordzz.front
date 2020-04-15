import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/Services/game.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-center-new-game',
  templateUrl: './game-center-new-game.component.html',
  styleUrls: ['./game-center-new-game.component.scss']
})
export class GameCenterNewGameComponent implements OnInit {
  onlineFriends$: Observable<string[]>;
  selectedFriend: string;

  constructor(private gameService:GameService) { }

  ngOnInit(): void {
    this.onlineFriends$ = this.gameService.onlineFriends;

  }

  startGame($event: any,friend:string ){
    console.log('friend :', friend);
    this.gameService.newGame('en-us',friend,15).then(res => {
      console.log('res :', res);
    });
  }
  startSoloGame($event: any){
    console.log('solo game :', $event);
    this.gameService.newSoloGame()
  }

}
