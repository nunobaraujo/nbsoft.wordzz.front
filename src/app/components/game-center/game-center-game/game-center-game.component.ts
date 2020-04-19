import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from 'src/app/Models/game';
import { GamePlayer } from 'src/app/Models/gamePlayer';
import { GameService } from 'src/app/Services/game.service';
import { BoardLetter } from 'src/app/Models/boardLetter';

@Component({
  selector: 'app-game-center-game',
  templateUrl: './game-center-game.component.html',
  styleUrls: ['./game-center-game.component.scss']
})
export class GameCenterGameComponent implements OnInit {
  game:Game;
  player:GamePlayer;
  opponent:GamePlayer;
  rack: BoardLetter[];

  constructor(private route: ActivatedRoute, private gameService:GameService) {
    this.route.data
    .subscribe((data) => {
      this.player = this.gameService.getPlayer(data.game.id) ; 
      this.opponent = this.gameService.getOpponent(data.game.id) ;
      this.game = data.game;
      this.rack = this.player.rack.map(l =>{
        return new BoardLetter(l,this.player.userName);
      });
      console.log('prack :',this.rack);
    }); 
  }

  ngOnInit(): void {    
  }

}
