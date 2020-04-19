import { Letter } from './letter';

export class BoardLetter{
    letter: Letter;
    owner:string;

    constructor(letter: Letter,owner:string){
        this.letter = letter;
        this.owner = owner;
    }
}