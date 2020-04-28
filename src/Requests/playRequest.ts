import { PlayLetter } from 'src/app/Models/playLetter';

export class PlayRequest
{
    gameId: string;
    userName:string;
    letters: PlayLetter[];
}