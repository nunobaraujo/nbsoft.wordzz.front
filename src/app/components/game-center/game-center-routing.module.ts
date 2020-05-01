import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameResolverService } from 'src/app/Services/game-resolver.service';

import { GcRootComponent } from './gc-root/gc-root.component';
import { GcNewGameComponent } from './gc-new-game/gc-new-game.component';
import { GcHomeComponent } from './gc-home/gc-home.component';
import { GcGameComponent } from './gc-game/gc-game.component';
import { GcActiveGamesComponent } from './gc-active-games/gc-active-games.component';
import { GcChallengesComponent } from './gc-challenges/gc-challenges.component';

const gameCenterRoutes: Routes = [
  {
    path: 'game-center',
    component: GcRootComponent,
    children: [
      {
        path: 'newgame',
        component: GcNewGameComponent
      },
      {
        path: 'challenges',
        component: GcChallengesComponent
      },
      {        
        path: '',
        component: GcActiveGamesComponent,
        children:[
        {
          path: ':id',
          component: GcGameComponent,
          resolve: {
            game: GameResolverService
          }
        },
        {
          path:'',
          component: GcHomeComponent
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
