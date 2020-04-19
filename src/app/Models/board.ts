import { BoardTile } from './boardTile';
import { WordPlay } from './wordPlay';

export class Board {    
    rows:number;
    columns: number;
    tiles:BoardTile[] ;
    words:WordPlay[];    
}