import { BonusType } from '../Enums/bonusType';

export class BoardTile {    
    id:number;
    boardId:number;
    x:number;
    y:number;
    bonus: BonusType;
}