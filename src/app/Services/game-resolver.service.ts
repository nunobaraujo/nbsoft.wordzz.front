import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
}                                 from '@angular/router';
import { Observable, of, EMPTY }  from 'rxjs';
import { mergeMap, take }         from 'rxjs/operators';

import { Game } from 'src/app/Models/game';

import { GameService } from './game.service';


@Injectable({
  providedIn: 'root'
})
export class GameResolverService implements Resolve<Game> {

  constructor(private gameService: GameService, private router: Router) { }
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):  Observable<Game> | Observable<never> {    
    let id = route.paramMap.get('id');
 
    return this.gameService.getGame(id).pipe(
      take(1),
      mergeMap(g => {
        if (g) {
          return of(g);
        } else { // id not found
          this.router.navigate(['']);
          return EMPTY;
        }
      })
    );  
  }
}
