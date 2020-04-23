import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';

@Component({
  selector: 'app-game-center-game',
  templateUrl: './game-center-game.component.html',
  styleUrls: ['./game-center-game.component.scss']
})
export class GameCenterGameComponent implements OnInit {
  gameManager:GameManager;

  constructor(private route: ActivatedRoute, private gameService:GameService) {
    this.route.data
    .subscribe((data) => {
      this.gameManager = gameService.getManager(data.game.id);            
    }); 
  }

  ngOnInit(): void {    
  }

  getTiles():string[]
  {
    return this.gameManager.game.board.tiles.map(t => `${t.x}-${t.y}`);    
  }

}
