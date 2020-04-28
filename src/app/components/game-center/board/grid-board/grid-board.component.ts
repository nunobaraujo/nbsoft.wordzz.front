import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CdkDragDrop, CdkDrag } from "@angular/cdk/drag-drop";
import { GridTileComponent } from '../grid-tile/grid-tile.component';

import { Game } from 'src/app/Models/game';
import { PlayLetter } from 'src/app/Models/playLetter';
import { BoardTile } from 'src/app/Models/boardTile';
import { BoardLetter } from 'src/app/Models/boardLetter';
import { GamePlayer } from 'src/app/Models/gamePlayer';

import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';
import { Subscription, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from 'src/app/modal/modal.component';
import { SelectLetterModalComponent } from 'src/app/components/select-letter-modal/select-letter-modal.component';

@Component({
  selector: 'app-grid-board',
  templateUrl: './grid-board.component.html',
  styleUrls: ['./grid-board.component.scss']
})
export class GridBoardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('gameManager') gameManager: GameManager;
  @ViewChildren(GridTileComponent) viewChildren!: QueryList<GridTileComponent>

  private currentPlaysSubscription:Subscription
  private moveHistorySubscription:Subscription
  //private lastPlay:PlayLetter[]=[];

  private boardFixedLetters:PlayLetter[]=[];
  private boardLetters:PlayLetter[]=[];

  dndConnections:string[] 
  player:GamePlayer;  

  email:string;
  constructor(private gameService:GameService, public dialog: MatDialog) {    
    
   }    
  ngOnInit(): void {
    this.dndConnections  =[];
    this.dndConnections.push("list-rack");    
  }
  ngAfterViewInit(): void {    
    console.log('ngAfterViewInit');
    this.player = this.gameManager.getPlayer() ;     
    
    if (!this.currentPlaysSubscription){
      setTimeout(() => {
        this.currentPlaysSubscription = this.gameManager.currentPlays$.subscribe(play => {
          this.boardLetters = play;
        })  
      });  
    }
    
    if(!this.moveHistorySubscription){
      setTimeout(() => { 
        this.moveHistorySubscription = this.gameManager.moveHistory$.subscribe( moves => {
          if (!!moves){
            this.boardFixedLetters = [];
            moves.forEach(move => {
              move.letters.forEach(l => {
                this.boardFixedLetters.push(l);
              });
            });
          }
        });
      });
    }

  }  
  ngOnDestroy(): void {
    this.currentPlaysSubscription.unsubscribe();
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(SelectLetterModalComponent, {
      width: '300px',
      data: {  "availableLetters" : this.gameManager.game.availableLetters}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.email = result;
    });
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
        console.log('Tile :', targetTile.x,targetTile.y);
        var playAllowed = this.gameManager.newLetterPlay(targetTile,letter);        
        if (letter.letter.isBlank){
          //Popup letter choose dialog
          this.openDialog();
        }

      }
      else{
        // Arrived from other board Tile (Move Tile inside board)
        var oldTile: BoardTile = new BoardTile();
        Object.assign( oldTile, event.item.data);      

        var newTile: BoardTile = new BoardTile();
        Object.assign( newTile, event.container.data);      
        console.log('Tile :', newTile.x,newTile.y);

        var playAllowed = this.gameManager.updateLetterPlay(oldTile,newTile);

        
      }
    }
  }

  getLetter(tile:BoardTile):BoardLetter{
    var fixed = this.boardFixedLetters.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    if (!!fixed){
      return fixed.letter;
    }

    var temp = this.boardLetters.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    if (!!temp){
      return temp.letter;
    }
    return null;
  }
  getLocked(tile:BoardTile):boolean{
    var fixed = this.boardFixedLetters.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    return !!fixed;
  }

  private getComponent (tile: BoardTile){
    var tileComponent:GridTileComponent = this.viewChildren.find( child => child.boardTile.x ===  tile.x && child.boardTile.y === tile.y );
    return tileComponent;
  }
}
