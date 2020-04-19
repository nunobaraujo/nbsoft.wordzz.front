import { Board } from './board';
import { GamePlayer } from './gamePlayer';
import { LetterBag } from './letterBag';
import { GameStatus } from '../Enums/gameStatus';

export class Game {    
    id:string;
    language:string;
    currentPlayer:string;
    currentStart:Date;
    currentPauseStart?:Date;    
    board:Board;
    player01:GamePlayer;
    player02:GamePlayer;
    status:GameStatus;
    letterBag:LetterBag;
}