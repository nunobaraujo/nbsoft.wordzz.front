import { GameChallenge } from './gameChallenge';

export class GameChallengeResult {    
    challengeId:string;
    accepted: boolean;
    gameId: string;
    challenge:GameChallenge;
}