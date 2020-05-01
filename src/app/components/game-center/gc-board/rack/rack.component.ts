import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { GameManager } from 'src/app/Managers/gameManger';
import { BoardTile } from 'src/app/Models/boardTile';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-rack',
  templateUrl: './rack.component.html',
  styleUrls: ['./rack.component.scss']
})
export class RackComponent implements OnInit , AfterViewInit {  
  @Input('gameManager') gameManager: GameManager;
  connectedTiles$: Observable<string[]>;
  constructor() { }
  
  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.connectedTiles$ = this.gameManager.rackConnectedTiles$;
    });
  }

  drop(event: CdkDragDrop<string[]>) {    
    if (event.container.id === event.previousContainer.id) {
      // move inside same list
      //moveItemInArray(this.list, event.previousIndex, event.currentIndex);
    } else {

      var tile:BoardTile = new BoardTile();
      Object.assign(tile, event.item.data);      
      this.gameManager.removeLetterPlay(tile);


    }
  }
}
