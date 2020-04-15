import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GameCenterComponent } from './game-center/game-center.component';
import { GameCenterHomeComponent } from './game-center-home/game-center-home.component';
import { GameCenterActiveGameListComponent } from './game-center-active-game-list/game-center-active-game-list.component';
import { GameCenterGameComponent } from './game-center-game/game-center-game.component';

import { GameCenterRoutingModule } from './game-center-routing.module';
import { GameCenterNewGameComponent } from './game-center-new-game/game-center-new-game.component';

@NgModule({
  declarations: [
    GameCenterComponent,
    GameCenterHomeComponent,
    GameCenterActiveGameListComponent,
    GameCenterGameComponent,
    GameCenterNewGameComponent
  ],
  imports: [
    CommonModule,
    GameCenterRoutingModule
  ]
})
export class GameCenterModule { }
