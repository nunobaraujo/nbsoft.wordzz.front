import { BoardTile } from './boardTile';

export class Board {    
    id:number;
    name:string;
    boardRows:number;
    boardColumns: number;
    tiles:BoardTile[];
}