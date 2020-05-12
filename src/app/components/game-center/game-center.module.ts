import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DragDropModule } from '@angular/cdk/drag-drop';


import { GameCenterRoutingModule } from './game-center-routing.module';
import { GridTileComponent } from './gc-board/grid-tile/grid-tile.component';
import { GridBoardComponent } from './gc-board/grid-board/grid-board.component';
import { RackComponent } from './gc-board/rack/rack.component';
import { BoardLetterComponent } from './gc-board/board-letter/board-letter.component';

import { GcRootComponent } from './gc-root/gc-root.component';
import { GcNewGameComponent } from './gc-new-game/gc-new-game.component';
import { GcHomeComponent } from './gc-home/gc-home.component';
import { GcGameComponent } from './gc-game/gc-game.component';
import { GcActiveGamesComponent } from './gc-active-games/gc-active-games.component';
import { GcGameStatusComponent } from './gc-game-status/gc-game-status.component';



@NgModule({
  declarations: [
    GcRootComponent,
    GcHomeComponent,
    GcNewGameComponent,
    GcGameComponent,
    GcActiveGamesComponent,
    GridTileComponent,
    GridBoardComponent,
    RackComponent,
    BoardLetterComponent,
    GcGameStatusComponent    
  ],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    DragDropModule,
    GameCenterRoutingModule
  ]
})
export class GameCenterModule { }
