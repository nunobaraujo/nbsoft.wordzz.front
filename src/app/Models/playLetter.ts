import { BoardTile } from './boardTile';
import { BoardLetter } from './boardLetter';
import { BonusType } from '../Enums/bonusType';

export class PlayLetter{
  letter:BoardLetter;  
  tile:BoardTile;    
  effectiveBonus: BonusType;

  constructor(tile:BoardTile,letter:BoardLetter) {
    this.tile = tile;
    this.letter = letter;
    this.effectiveBonus = BonusType.Regular;
  }
}