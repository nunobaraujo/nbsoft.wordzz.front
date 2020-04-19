import { BoardTile } from './boardTile';
import { BoardLetter } from './boardLetter';

export class WordPlay{
    playDate: Date;
    letters: BoardLetter[];
    liles: BoardTile[] ;
    owner: string ;
    score: number;
}