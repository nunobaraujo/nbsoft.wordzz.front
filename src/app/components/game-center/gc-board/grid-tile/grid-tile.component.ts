import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { BoardTile } from 'src/app/Models/boardTile';
import { BonusType } from 'src/app/Enums/bonusType';
import { BoardLetter } from 'src/app/Models/boardLetter';

import { faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-grid-tile',
  templateUrl: './grid-tile.component.html',
  styleUrls: ['./grid-tile.component.scss']
})
export class GridTileComponent implements OnInit {
  @Input() boardTile: BoardTile;
  @Input() letter:BoardLetter = null;
  @Input() isLocked:boolean;  
  @Input() lastPlay:boolean;  
  
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
        return  "double-word";
      case BonusType.TripleLetter:
        return  "triple-letter";
      case BonusType.DoubleLetter:
        return "double-letter";
      default:
        return "";
    }
  }
  private getText():string{
    switch (this.boardTile.bonus) {
      case BonusType.TripleWord:
        return "TW";    
      case BonusType.DoubleWord:
        return "DW";    
      case BonusType.TripleLetter:
        return "TL";    
        case BonusType.DoubleLetter:
        return "DL";    
      default:
        return "";
    }
  }  

 
}
