import { PlayLetter } from './playLetter';
import { PlayWord } from './playWord';


export class PlayMove{
    player:string;
    letters: PlayLetter[];
    playStart: Date;
    playFinish?:Date;
    words: PlayWord[];
    score:number;
}