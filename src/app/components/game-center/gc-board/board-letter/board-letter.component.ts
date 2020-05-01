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
  
    

  constructor() { }

  ngOnInit(): void {    
    
  }
  
  getClass():string{
    if (this.isLocked){
      return "board-letter-locked"
    }
    else{
      return "board-letter-unlocked"
    }
  }
}
