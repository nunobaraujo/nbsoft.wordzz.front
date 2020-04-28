import { GameLogDetails } from './gameLogDetails';

export class GameLog {
    sender: string;
    date: string;
    score:number;
    details: GameLogDetails[];
}