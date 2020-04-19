import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY }  from 'rxjs';
import { mergeMap, take }         from 'rxjs/operators';

import { Game } from 'src/app/Models/game';
import { GameService } from 'src/app/Services/game.service';


@Injectable({
  providedIn: 'root'
})
export class GameResolverServiceService implements Resolve<Game> {

  constructor(private gs: GameService, private router: Router) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<Game> | Observable<never> {
    if (!this.gs){
      return EMPTY;
    }
    
    let id = route.paramMap.get('id');
    return this.gs.getGame(id).pipe(
      take(1),
      mergeMap(g => {
        if (g) {
          return of(g);
        } else { // id not found
          this.router.navigate(['/game-center']);
          return EMPTY;
        }
      })
    );

  }
}
