import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { GridTileComponent } from '../grid-tile/grid-tile.component';

import { Game } from 'src/app/Models/game';
import { PlayLetter } from 'src/app/Models/playLetter';
import { BoardTile } from 'src/app/Models/boardTile';
import { BoardLetter } from 'src/app/Models/boardLetter';
import { GamePlayer } from 'src/app/Models/gamePlayer';

import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-grid-board',
  templateUrl: './grid-board.component.html',
  styleUrls: ['./grid-board.component.scss']
})
export class GridBoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('gameManager') gameManager: GameManager;
  @ViewChildren(GridTileComponent) viewChildren!: QueryList<GridTileComponent>

  private currentPlaysSubscription:Subscription
  private lastPlay:PlayLetter[]=[];

  dndConnections:string[] 
  player:GamePlayer;  
  constructor(private gameService:GameService) {    
    
   }    
  ngOnInit(): void {
    this.dndConnections  =[];
    this.dndConnections.push("list-rack");    
  }
  ngAfterViewInit(): void {    
    console.log('ngAfterViewInit');
    this.player = this.gameService.getPlayer(this.gameManager.game.id) ;     
    
    if (!this.currentPlaysSubscription){
      setTimeout(() => {
        this.currentPlaysSubscription = this.gameManager.currentPlays$.subscribe(play => {
          if (!!play) {                           
            
            // Removed Plays from visual element
            this.lastPlay.forEach(lp =>{            
              // Verify if any play was removed
              var playStillExists = play
                .find(newp => newp.tile.x === lp.tile.x && newp.tile.y === lp.tile.y);              
              if (!playStillExists)
              {
                // Play was removed (Letter was given back to rack)
                let child = this.getComponent(lp.tile);
                child.removeLetter();
              }
            });


            // Add Plays to visual element       
            play.forEach(p => {
              let child = this.getComponent(p.tile);
              child.setLetter(p.letter);
            });  
            
            Object.assign(this.lastPlay,play);
          }    
        })  
      });  
    }      
  }  
  ngOnDestroy(): void {
    this.currentPlaysSubscription.unsubscribe();
  }
  
  getCoordinate(tile:BoardTile):string {
    return this.gameManager.getCoordinate(tile);
  }
  getTileConnections(tile:BoardTile):string[]{
    return this.gameManager.getTileConnections(tile);
  }
  
  drop(event: CdkDragDrop<object>) {    
    if (event.container.id !== event.previousContainer.id) {

      if (event.previousContainer.id == "list-rack")
      {
        // Arrived from Player Rack                  
        var letter:BoardLetter = new BoardLetter(-1,null,null);
        Object.assign(letter, event.item.data);      
        
        var targetTile: BoardTile = new BoardTile();
        Object.assign(targetTile, event.container.data);      
        
        // apply new play
        var playAllowed = this.gameManager.newLetterPlay(targetTile,letter);        

      }
      else{
        // Arrived from other board Tile (Move Tile inside board)
        var oldTile: BoardTile = new BoardTile();
        Object.assign( oldTile, event.item.data);      

        var newTile: BoardTile = new BoardTile();
        Object.assign( newTile, event.container.data);      

        var playAllowed = this.gameManager.updateLetterPlay(oldTile,newTile);

        console.log('event.previousContainer.id :', event.previousContainer.id);
      }
    }
  }


  private getComponent (tile: BoardTile){
    var tileComponent:GridTileComponent = this.viewChildren.find( child => child.boardTile.x ===  tile.x && child.boardTile.y === tile.y );
    return tileComponent;
  }
}
