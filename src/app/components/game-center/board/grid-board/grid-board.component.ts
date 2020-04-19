import { Component, OnInit, Input } from '@angular/core';
import { Game } from 'src/app/Models/game';

@Component({
  selector: 'app-grid-board',
  templateUrl: './grid-board.component.html',
  styleUrls: ['./grid-board.component.scss']
})
export class GridBoardComponent implements OnInit {
  @Input('game') game: Game;
  constructor() { }

  ngOnInit(): void {
    console.log(this.game);
  }

}
