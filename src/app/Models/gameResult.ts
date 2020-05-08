import { FinishReason } from '../Enums/finishReason';

export class GameResult {
    winner:string;
    p1Score:number;
    p1Average:number;
    p1PlayCount:number;
    p2Score:number;
    p2Average:number;
    p2PlayCount:number;
    duration:number;
    reason:FinishReason;
}