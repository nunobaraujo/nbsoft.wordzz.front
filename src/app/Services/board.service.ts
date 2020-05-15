import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Lexicon } from '../Models/lexicon';
import { Board } from '../Models/board';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor(private http: HttpClient) { }

  getBoards(){
    return this.http.get<Board[]>(`${environment.apiUrl}/board`)
    .pipe(map(boards => {
      if (!boards) {
        return null;
      }

      let retval:Board[] = [];
      Object.assign(retval, boards)
      return retval;
    }));
  }

}
