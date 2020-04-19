import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameCenterComponent } from './game-center/game-center.component';
import { GameCenterHomeComponent } from './game-center-home/game-center-home.component';
import { GameCenterActiveGameListComponent } from './game-center-active-game-list/game-center-active-game-list.component';
import { GameCenterGameComponent } from './game-center-game/game-center-game.component';
import { GameCenterNewGameComponent } from './game-center-new-game/game-center-new-game.component';
import { GameCenterChallengeListComponent } from './game-center-challenge-list/game-center-challenge-list.component';
import { GameResolverServiceService } from './services/game-resolver-service.service';

const gameCenterRoutes: Routes = [
  {
    path: 'game-center',
    component: GameCenterComponent,
    children: [
      {
        path: 'newgame',
        component: GameCenterNewGameComponent
      },
      {
        path: 'challenges',
        component: GameCenterChallengeListComponent
      },
      {        
        path: '',
        component: GameCenterActiveGameListComponent,
        children:[
        {
          path: ':id',
          component: GameCenterGameComponent,
          resolve: {
            game: GameResolverServiceService
          }
        },
        {
          path:'',
          component: GameCenterHomeComponent
        }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(gameCenterRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class GameCenterRoutingModule { }
