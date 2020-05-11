import { BehaviorSubject, of, Subscription, Observable, from } from 'rxjs';

import { Game } from 'src/app/Models/game';
import { GamePlayer } from 'src/app/Models/gamePlayer';
import { BoardLetter } from 'src/app/Models/boardLetter';

import { GameHub } from 'src/app/Managers/gameHub';
import { PlayLetter } from '../Models/playLetter';
import { BoardTile } from '../Models/boardTile';
import { PlayMove } from '../Models/playMove';
import { User } from '../Models/user';
import { Board } from '../Models/board';
import { GameLog } from '../Models/gameLog';
import { GameLogDetails } from '../Models/gameLogDetails';
import { Letter } from '../Models/letter';
import { GameResult } from '../Models/gameResult';


export class GameManager{
    private gameSubscription:Subscription;

    game:Game;
    gameId:string ;
    player:GamePlayer;
    opponent:GamePlayer;
    initialRack: BoardLetter[];
    currentUser:User;
    board:Board;
    availableLetters:string;

    private _activeRack = new BehaviorSubject<BoardLetter[]>(null);  
    private activeRackStore: { rack:  BoardLetter[] } ={ rack: []};
    activeRack$ = this._activeRack.asObservable();

    private _currentPlays = new BehaviorSubject<PlayLetter[]>(null);  
    private currentPlaysStore: { letters:  PlayLetter[] } ={ letters: []};
    currentPlays$ = this._currentPlays.asObservable();

    private _moveHistory = new BehaviorSubject<PlayMove[]>(null);  
    private moveHistoryStore: { moves:  PlayMove[] } ={ moves: []};
    moveHistory$ = this._moveHistory.asObservable();

    private _lastPlay = new BehaviorSubject<BoardTile[]>(null);
    private lastPlayStore:{ tiles:  BoardTile[] } ={ tiles: []};
    lastPlay$= this._lastPlay.asObservable();

    private _rackConnectedTiles = new BehaviorSubject<string[]>(null);  
    private rackConnectedTilesStore: { connections:  string[] } ={ connections: []};
    rackConnectedTiles$ = this._rackConnectedTiles.asObservable();

    private _gameLog = new BehaviorSubject<GameLog[]>(null);  
    private gameLogStore: { logs:  GameLog[] } ={ logs: []};
    gameLog$ = this._gameLog.asObservable();

    private _currentPlayer = new BehaviorSubject<string>(null);  
    private  currentPlayer: string="";
    currentPlayer$ = this._currentPlayer.asObservable();

    private _gameEnded = new BehaviorSubject<GameResult>(null);    
    gameEnded$ = this._gameEnded.asObservable();

    
    constructor(private gameHub:GameHub, gameId:string){
        this.gameId = gameId;
        this.currentUser = gameHub.currentUser;        
        
        this.gameSubscription = this.gameHub.getGame(this.gameId).subscribe(g =>{
            this.board = g.board;
            this.refreshGame(g);
        });
    }
            
    getCoordinate(tile:BoardTile){
        return `${tile.x}-${tile.y}`
    }
    newLetterPlay(tile:BoardTile, letter:BoardLetter):boolean
    {           
        // check current play
        var isTileUsed = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === tile.x && pl.tile.y === tile.y);
        
        if (!!isTileUsed){
            return false;
        }

        //check history
        var isTaken:Boolean = false;
        this.moveHistoryStore.moves.forEach(m => {
            var index = m.letters.findIndex(l => l.tile.x === tile.x && l.tile.y === tile.y);
            if (index !== -1)
            {
                isTaken = true;                
            }
        });
        if (isTaken){
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
        if (play.letter.letter.isBlank){            
            play.letter.letter.char = ' ';
        }
        this.addToRack(play.letter);
        return true;
    }
    updateLetterPlay(source:BoardTile, target:BoardTile):boolean{
        
        // Validate is old tile is in current plays
        var oldPlay = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === source.x && pl.tile.y === source.y);
        var letter = oldPlay.letter;
        
        let char  = letter.letter.char;
        
                
        // check current play
        var isTileUsed = this.currentPlaysStore.letters
            .find(pl => pl.tile.x === target.x && pl.tile.y === target.y);        
        if (!!isTileUsed){
            return false;
        }

        //check history
        var isTaken:Boolean = false;
        this.moveHistoryStore.moves.forEach(m => {
            var index = m.letters.findIndex(l => l.tile.x === target.x && l.tile.y === target.y);
            if (index !== -1)
            {
                isTaken = true;                
            }
        });
        if (isTaken){
            return false;
        }

        // remove old play
        var removed = this.removeLetterPlay(source);
        if (!removed){
            return removed;
        }
        // add new play
        var newLetter = new Letter();
        Object.assign(newLetter,letter.letter);
        if (letter.letter.isBlank){
            newLetter.char = char;
        }
        letter.letter = newLetter;
        return this.newLetterPlay(target,letter);
    }

    updateRackConnections(){
        var result = this.game.board.tiles.map(t =>{
            return this.getCoordinate(t);
        });

        // remove connections to historic moves
         this.moveHistoryStore.moves.forEach(m =>{
            m.letters.forEach(l => {
                var currentIndex = result.findIndex(t => t == this.getCoordinate(l.tile));
                if (currentIndex !== -1){
                    result.splice(currentIndex,1);
                }
            });
            
        });
        this.rackConnectedTilesStore.connections = result;
        this._rackConnectedTiles.next(Object.assign({}, this.rackConnectedTilesStore).connections);  
    }
    
    
    getTileConnections(tile:BoardTile):string[]{
        var result = this.game.board.tiles.map(t =>{
            return this.getCoordinate(t);
        });
        result.push("list-rack")        

        // remove self
        var currentIndex = result.findIndex(t => t == this.getCoordinate(tile));        
        if (currentIndex !== -1){
            result.splice(currentIndex,1);
        }        

        // remove connections to historic moves
        this.moveHistoryStore.moves.forEach(m =>{
            m.letters.forEach(l => {
                var currentIndex = result.findIndex(t => t == this.getCoordinate(l.tile));
                if (currentIndex !== -1){
                    result.splice(currentIndex,1);
                }
            });
            
        });
        
        return result;
    }

    public getOpponent():GamePlayer{
        if (!this.game){
            return null;
        }
        if( this.currentUser.username == this.game.player01.userName){
          return this.game.player02;
        }
        else{
          return this.game.player01;
        }
    }
    public getPlayer():GamePlayer{        
        if (!this.game){
            return null;
        }
        if( this.currentUser.username == this.game.player01.userName){
          return this.game.player01;
        }
        else{
          return this.game.player02;
        }
    }
      

    public async play():Promise<string>{

        var result =  await this.gameHub.play(this.game.id,this.currentPlaysStore.letters);
        if(result.moveResult == "OK")
        {                
            if (!!this.gameSubscription)
            {
                this.gameSubscription.unsubscribe();
            }        
            this.gameSubscription = this.gameHub.getGame(this.gameId).subscribe(g =>{                   
                console.log('refresGamme :>> ');
                this.refreshGame(g);
            });
            return "OK"
        }
        else{
            return result.moveResult;
        }

        /*this.gameService.play(this.game.id,this.currentPlaysStore.letters).then(res=>{            
            if(res.moveResult == "OK")
            {                
                if (!!this.gameSubscription)
                {
                    this.gameSubscription.unsubscribe();
                }        
                this.gameSubscription = this.gameService.getGame(this.gameId).subscribe(g =>{                   
                    this.refreshGame(g);
                });
            }
            else{
                alert(res.moveResult);
            }
        });*/
    }
    public pass(){
        this.gameHub.pass(this.game.id).subscribe(res=>{            
            if(res.moveResult == "OK")
            {                
                if (!!this.gameSubscription)
                {
                    this.gameSubscription.unsubscribe();
                }        
                this.gameSubscription = this.gameHub.getGame(this.gameId).subscribe(g =>{                   
                    this.refreshGame(g);
                });
                return;
            }            
            if(res.moveResult == "GameOver"){
                this.gameOver(res.gameOverResult);
                return;
            }
            console.log("Play Result:",res.moveResult);
        });
    }
    public forfeit(){
        this.gameHub.forfeit(this.game.id).subscribe(res=>{            
            if(res.moveResult == "GameOver")
            {                
                this.gameOver(res.gameOverResult);
            }            
        });
    }
    
    public onPlayReceived(userName:string){
        if (!!this.gameSubscription)
        {
            this.gameSubscription.unsubscribe();
        }        
        this.gameSubscription = this.gameHub.getGame(this.gameId).subscribe(g =>{                   
            this.refreshGame(g);
        });
    }

    public onGameOverReceived(result: GameResult){
        this.gameOver(result);
    }
    
    private refreshGame(game:Game){        
        
        this.game = game;            
        this.player = this.getPlayer() ; 
        this.opponent = this.getOpponent();        

        var lastMove= this.game.playMoves[this.game.playMoves.length-1];
        this.lastPlayStore.tiles = [];
        lastMove?.words.forEach(Word => {
            Word.letters.forEach(letter => this.lastPlayStore.tiles.push(letter.tile));
        });
        this._lastPlay.next(Object.assign({}, this.lastPlayStore).tiles);

        
           
        // clean current letter moves
        this.currentPlaysStore ={ letters: []};
        this._currentPlays.next(Object.assign({}, this.currentPlaysStore).letters);  
    
        // assign current rack to observable
        this.initialRack = this.player.rack.map((l,index) =>{
            return new BoardLetter(index,l,this.player.userName);
        });
        Object.assign(this.activeRackStore.rack, this.initialRack);
        this._activeRack.next(Object.assign({}, this.activeRackStore).rack);

        // assign move history to observable
        this.moveHistoryStore.moves = this.game.playMoves;
        this._moveHistory.next(Object.assign({}, this.moveHistoryStore).moves);

        // Update game log
        this.gameLogStore.logs = [];
        this.moveHistoryStore.moves.forEach(m =>this.addMoveLog(m));                
        
        // Update current player
        this.currentPlayer = game.currentPlayer;
        this._currentPlayer.next(this.currentPlayer);
        

        // update rack drag and drop connections
        this.updateRackConnections();
    }
    private gameOver(result: GameResult){        
        this._gameEnded.next(result);
        this._gameEnded.next(null);
    }

    private addMoveLog(move:PlayMove){
        var logEntry = new GameLog();
        logEntry.sender = move.player;
        logEntry.date = Date.now.toString();
        logEntry.score = move.score;
        logEntry.details = [];        
        if (move.words.length>0){
            move.words.forEach(w => {
                let word :string = w.letters.map(l => l.letter.letter.char).join()
                let pWord  =  word.split(",").join("");
                var detail = new GameLogDetails();           
                detail.word = pWord;
                detail.title = w.description;
                detail.score = w.score;            
                logEntry.details.push(detail);              
            });
        }        
        
        this.gameLogStore.logs.push(logEntry);
        this._gameLog.next(Object.assign({}, this.gameLogStore).logs);    
                
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