import { Component, OnInit, Input, AfterViewInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { GridTileComponent } from '../grid-tile/grid-tile.component';

import { PlayLetter } from 'src/app/Models/playLetter';
import { BoardTile } from 'src/app/Models/boardTile';
import { BoardLetter } from 'src/app/Models/boardLetter';
import { GamePlayer } from 'src/app/Models/gamePlayer';

import { GameService } from 'src/app/Services/game.service';
import { GameManager } from 'src/app/Managers/gameManger';
import { Subscription, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SelectLetterModalComponent } from 'src/app/Dialogs/select-letter-modal/select-letter-modal.component';
import { MapOperator } from 'rxjs/internal/operators/map';

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
  private lastPlaySubscription:Subscription  
  
  private boardFixedLetters:PlayLetter[]=[];
  private boardLetters:PlayLetter[]=[];
  private lastPlay:BoardTile[]=[];
  
  dndConnections:string[] 
  player:GamePlayer;    
  constructor(public dialog: MatDialog) {    
    
   }    
  ngOnInit(): void {
    this.dndConnections  =[];
    this.dndConnections.push("list-rack");    

    if (!this.lastPlaySubscription){      
      this.lastPlaySubscription = this.gameManager.lastPlay$.subscribe(lp => {
        this.lastPlay = lp;
      });  
    }
    if (!this.currentPlaysSubscription){      
      this.currentPlaysSubscription = this.gameManager.currentPlays$.subscribe(play => {
        this.boardLetters = play;
      });
    }  

    if(!this.moveHistorySubscription){      
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
    }
  }
  ngAfterViewInit(): void {        
    this.player = this.gameManager.getPlayer() ;        
    /*if (!this.currentPlaysSubscription){
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
    }*/

    

  }  
  ngOnDestroy(): void {
    this.currentPlaysSubscription.unsubscribe();
    this.moveHistorySubscription.unsubscribe();
  }
  openSelectLetter(tile:BoardTile, letter:BoardLetter): void {
    const dialogRef = this.dialog.open(SelectLetterModalComponent, {
      width: '300px',
      data: {  "availableLetters" : this.gameManager.game.availableLetters}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        letter.letter.char = result; 
        var newLetter = new BoardLetter(letter.id, Object.assign({},letter.letter), letter.owner);
        this.gameManager.newLetterPlay(tile, newLetter);
      }
    });
  }
  
  getCoordinate(tile:BoardTile):string {
    return this.gameManager.getCoordinate(tile);
  }
  getTileConnections(tile:BoardTile):string[]{
    return this.gameManager.getTileConnections(tile);
  }
  getLetter(tile:BoardTile):BoardLetter{
    var fixed = this.boardFixedLetters.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    if (!!fixed){
      return fixed.letter;
    }

    var temp = this.boardLetters?.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    if (!!temp){
      return temp.letter;
    }
    return null;
  }
  getLocked(tile:BoardTile):boolean{
    var fixed = this.boardFixedLetters.find(bl => bl.tile.x === tile.x && bl.tile.y === tile.y);
    return !!fixed;
  }  
  getLastPlay(tile:BoardTile):boolean{
    var lastplay = this.lastPlay.find(bl => bl.x === tile.x && bl.y === tile.y);
    return !!lastplay;
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
        if (letter.letter.isBlank){
          //Popup letter choose dialog
          this.openSelectLetter(targetTile,letter);
        }
        else
        {
          this.gameManager.newLetterPlay(targetTile,letter);        
        }

      }
      else{
        // Arrived from other board Tile (Move Tile inside board)
        var oldTile: BoardTile = new BoardTile();
        Object.assign( oldTile, event.item.data);      

        var newTile: BoardTile = new BoardTile();
        Object.assign( newTile, event.container.data);      
        
        var playAllowed = this.gameManager.updateLetterPlay(oldTile,newTile);

        
      }
    }
  }

  

}
