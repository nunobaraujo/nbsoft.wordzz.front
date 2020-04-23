import { Letter } from './letter';

export class BoardLetter{
    id:number;
    letter: Letter;
    owner:string;

    constructor(id:number, letter: Letter, owner:string){
        this.id = id;
        this.letter = letter;
        this.owner = owner;
    }
}