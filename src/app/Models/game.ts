import { Board } from './board';
import { GamePlayer } from './gamePlayer';
import { LetterBag } from './letterBag';
import { GameStatus } from '../Enums/gameStatus';
import { PlayMove } from './playMove';

export class Game {    
    id:string;
    language:string;
    creationDate:Date;
    board:Board;
    
    currentPlayer:string;
    player01:GamePlayer;
    player02:GamePlayer;

    status:GameStatus;
    letterBag:LetterBag;    
    currentStart:Date;
    currentPauseStart?:Date;    
    
    playMoves: PlayMove[];    
}