import { Component, OnInit, Input } from '@angular/core';
import { BoardLetter } from 'src/app/Models/boardLetter';

@Component({
  selector: 'app-board-letter',
  templateUrl: './board-letter.component.html',
  styleUrls: ['./board-letter.component.scss']
})
export class BoardLetterComponent implements OnInit {
  @Input() boardLetter: BoardLetter;
  @Input() isLocked: boolean;
  @Input() lastPlay: boolean;
  @Input() inRack: boolean;
  
    

  constructor() { }

  ngOnInit(): void {    
    
  }
  
  getClass():string{
    var cssClass = "";
    if (this.isLocked){
      cssClass += " board-letter-locked";
    }
    else{
      cssClass += " board-letter-unlocked"
    }

    if (this.inRack){
      cssClass += " board-letter-inrack"
    }
    else{
      cssClass += " board-letter-inboard"
    }
    return cssClass;
  }
}
