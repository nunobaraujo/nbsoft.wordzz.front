import { Board } from './board';
import { GamePlayer } from './gamePlayer';
import { LetterBag } from './letterBag';
import { GameStatus } from '../Enums/gameStatus';
import { PlayMove } from './playMove';
import { FinishReason } from '../Enums/finishReason';

export class Game {    
    id:string;
    board:Board;
    language:string;
    creationDate:Date;
    currentPlayer:string;
        
    player01:GamePlayer;
    player02:GamePlayer;
    letterBag:LetterBag;    

    status:GameStatus;    
    currentStart:Date;
    currentPauseStart?:Date;    
        
    availableLetters:string[]

    winner:string;
    finishReason:FinishReason;
    consecutivePasses:number;
    finishDate?:Date;

    p1FinalScore: number;
    p2FinalScore: number;

    playMoves: PlayMove[];    
}