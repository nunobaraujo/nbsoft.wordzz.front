import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { GameCenterComponent } from './game-center/game-center.component';
import { GameCenterHomeComponent } from './game-center-home/game-center-home.component';
import { GameCenterActiveGameListComponent } from './game-center-active-game-list/game-center-active-game-list.component';
import { GameCenterGameComponent } from './game-center-game/game-center-game.component';

import { GameCenterRoutingModule } from './game-center-routing.module';
import { GameCenterNewGameComponent } from './game-center-new-game/game-center-new-game.component';
import { GameCenterChallengeListComponent } from './game-center-challenge-list/game-center-challenge-list.component';
import { GridTileComponent } from './board/grid-tile/grid-tile.component';
import { GridBoardComponent } from './board/grid-board/grid-board.component';
import { RackComponent } from './board/rack/rack.component';
import { BoardLetterComponent } from './board/board-letter/board-letter.component';



@NgModule({
  declarations: [
    GameCenterComponent,
    GameCenterHomeComponent,
    GameCenterActiveGameListComponent,
    GameCenterGameComponent,
    GameCenterNewGameComponent,
    GameCenterChallengeListComponent,
    GridTileComponent,
    GridBoardComponent,
    RackComponent,
    BoardLetterComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    DragDropModule,
    GameCenterRoutingModule,
    
  ]
})
export class GameCenterModule { }
