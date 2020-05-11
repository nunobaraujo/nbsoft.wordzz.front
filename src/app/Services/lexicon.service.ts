import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Lexicon } from '../Models/lexicon';

@Injectable({
  providedIn: 'root'
})
export class LexiconService {

  constructor(private http: HttpClient) { }

  getLexicons(){
    return this.http.get<Lexicon[]>(`${environment.apiUrl}/lexicon`)
    .pipe(map(stats => {
      if (!stats) {
        return null;
      }

      let retval:Lexicon[] = [];
      Object.assign(retval, stats)
      return retval;
    }));
  }
}
