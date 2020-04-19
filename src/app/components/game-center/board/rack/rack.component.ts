import { Component, OnInit, Input } from '@angular/core';
import { BoardLetter } from 'src/app/Models/boardLetter';

@Component({
  selector: 'app-rack',
  templateUrl: './rack.component.html',
  styleUrls: ['./rack.component.scss']
})
export class RackComponent implements OnInit {  
  @Input('playerRack') rack: BoardLetter[];
  constructor() { }

  ngOnInit(): void {
    console.log('player rack :', this.rack);
  }

}
