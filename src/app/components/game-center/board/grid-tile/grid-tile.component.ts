import { Component, OnInit, Input } from '@angular/core';
import { BoardTile } from 'src/app/Models/boardTile';
import { BonusType } from 'src/app/Enums/bonusType';
import { faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-grid-tile',
  templateUrl: './grid-tile.component.html',
  styleUrls: ['./grid-tile.component.scss']
})
export class GridTileComponent implements OnInit {
  @Input('boardTile') boardTile: BoardTile;
  faStar = faStar;
  text:string;
  bonusClass:string;
  isStar:boolean;
  constructor() 
  { 
  }

  ngOnInit(): void {    
    this.bonusClass = this.getBonus();
    this.text = this.getText();
    this.isStar = this.boardTile.bonus == BonusType.Center;
  }

  private getBonus():string{
    switch (this.boardTile.bonus) {
      case BonusType.Center:
        return "star-square";
      case BonusType.TripleWord:
        return "triple-word";    
      case BonusType.DoubleWord:
        return "double-word";    
      case BonusType.TripleLetter:
        return "triple-letter";    
        case BonusType.DoubleLetter:
        return "double-letter";    
      default:
        return "";
    }
  }
  private getText():string{
    switch (this.boardTile.bonus) {
      case BonusType.TripleWord:
        return "Triple Word";    
      case BonusType.DoubleWord:
        return "Double Word";    
      case BonusType.TripleLetter:
        return "Triple Letter";    
        case BonusType.DoubleLetter:
        return "Double Letter";    
      default:
        return "";
    }
  }

}
