import { BehaviorSubject, of } from 'rxjs';

import { Game } from 'src/app/Models/game';
import { GamePlayer } from 'src/app/Models/gamePlayer';
import { BoardLetter } from 'src/app/Models/boardLetter';

import { GameService } from 'src/app/Services/game.service';
import { PlayLetter } from '../Models/playLetter';
import { BoardTile } from '../Models/boardTile';
import { GamePlayDirection } from '../Enums/gamePlayDirection';


export class GameManager{
    game:Game;
    player:GamePlayer;
    opponent:GamePlayer;
    initialRack: BoardLetter[];

    private _activeRack = new BehaviorSubject<BoardLetter[]>(null);  
    private activeRackStore: { rack:  BoardLetter[] } ={ rack: []};
    activeRack$ = this._activeRack.asObservable();

    private _currentPlays = new BehaviorSubject<PlayLetter[]>(null);  
    private currentPlaysStore: { letters:  PlayLetter[] } ={ letters: []};
    currentPlays$ = this._currentPlays.asObservable();
    
    constructor(private gameService:GameService, game:Game){
        this.game = game;
        this.player = this.gameService.getPlayer(game.id) ; 
        this.opponent = this.gameService.getOpponent(game.id) ;      
        this.initialRack = this.player.rack.map((l,index) =>{
            return new BoardLetter(index,l,this.player.userName);
        });
        Object.assign(this.activeRackStore.rack, this.initialRack);
        this._activeRack.next(Object.assign({}, this.activeRackStore).rack);
    }

        
    getCoordinate(tile:BoardTile){
        return `${tile.x}-${tile.y}`
    }
    newLetterPlay(tile:BoardTile, letter:BoardLetter):boolean
    {  
        // validate if the tile is already filled
        // TODO: check play History

        // check current play
        var isTileUsed = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === tile.x && pl.tile.y === tile.y);
        
        if (!!isTileUsed){
            return false;
        }

        var play = new PlayLetter(tile,letter);
        this.currentPlaysStore.letters.push(play);
        this._currentPlays.next(Object.assign({}, this.currentPlaysStore).letters);  

        this.removeFromRack(letter);
        return true;
    }
    removeLetterPlay(tile:BoardTile):boolean{
        
        var playIndex = this.currentPlaysStore.letters
            .findIndex(pl => pl.tile.x === tile.x && pl.tile.y === tile.y);
        
        if (playIndex === -1){
            return false;
        }

        var play = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === tile.x && pl.tile.y === tile.y);

        this.currentPlaysStore.letters.splice(playIndex,1);
        this._currentPlays.next(Object.assign({}, this.currentPlaysStore).letters);
        
        // Add letter to Rack
        this.addToRack(play.letter);
        return true;
    }
    updateLetterPlay(source:BoardTile, target:BoardTile):boolean{
        
        // Validate is old tile is in current plays
        var oldPlay = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === source.x && pl.tile.y === source.y);
        var letter = oldPlay.letter;

        // validate id destination tile us free
        // TODO: check play History

        // check current play
        var isTileUsed = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === target.x && pl.tile.y === target.y);        
        if (!!isTileUsed){
            return false;
        }

        // remove old play
        var removed = this.removeLetterPlay(source);
        if (!removed){
            return removed;
        }
        // add new play
        return this.newLetterPlay(target,letter);
    }

    getCurrentPlayScore():number{
        let result:number = -1;
        let direction= this.getCurrentPlayDirection()
        if (direction == GamePlayDirection.None){
            return -1; // Invalid tile layout
        }
        

        return result;
    }
    getCurrentPlayDirection():GamePlayDirection{
        let distictX = [...new Set(this.currentPlaysStore.letters.map( p => p.tile.x))];
        if (distictX.length = 1){
            return GamePlayDirection.Vertical;
        }
        let distictY = [...new Set(this.currentPlaysStore.letters.map( p => p.tile.y))];
        if (distictY.length = 1){
            return GamePlayDirection.Horizontal;
        }
        return GamePlayDirection.None;
    }
    

    getTileConnections(tile:BoardTile):string[]{
        var result = this.game.board.tiles.map(t =>{            
            return this.getCoordinate(t);
        });
        var currentIndex = result.findIndex(t => t == this.getCoordinate(tile));
        if (currentIndex !== -1){
            result.splice(currentIndex,1);
        }        
        result.push("list-rack")        
        return result;
    }
    
    

    private addToRack(letter:BoardLetter):void{
        this.activeRackStore.rack.push(letter);
        this._activeRack.next(Object.assign({}, this.activeRackStore).rack);
    }
    private removeFromRack(letter:BoardLetter):void{
        var letterIndex = this.activeRackStore.rack.findIndex( l => l.id == letter.id);
        if ( letterIndex !== -1){
            this.activeRackStore.rack.splice(letterIndex,1);
            this._activeRack.next(Object.assign({}, this.activeRackStore).rack);
        }
    }

}