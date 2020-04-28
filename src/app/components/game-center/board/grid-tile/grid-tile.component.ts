import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BoardTile } from 'src/app/Models/boardTile';
import { BonusType } from 'src/app/Enums/bonusType';
import { BoardLetter } from 'src/app/Models/boardLetter';

import { faStar } from '@fortawesome/free-solid-svg-icons';
import { BoardLetterComponent } from '../board-letter/board-letter.component';

@Component({
  selector: 'app-grid-tile',
  templateUrl: './grid-tile.component.html',
  styleUrls: ['./grid-tile.component.scss']
})
export class GridTileComponent implements OnInit {
  @Input('boardTile') boardTile: BoardTile;
  @Input('letter') letter:BoardLetter = null;
  @Input('isLocked') isLocked:boolean;
  faStar = faStar;
  text:string;
  bonusClass:string;
  isStar:boolean;  
  constructor(private cdr: ChangeDetectorRef ) 
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
