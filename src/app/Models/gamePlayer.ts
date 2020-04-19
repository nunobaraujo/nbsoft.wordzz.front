import { Letter } from './letter';
import { PlayTurn } from './playTurn';

export class GamePlayer{
    userName:string;
    firstName:string;
    lastName:string;
    score:number;
    rack:Letter[];
    history:PlayTurn[];
}