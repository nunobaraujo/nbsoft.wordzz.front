import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Lexicon } from '../Models/lexicon';
import { Word } from '../Models/word';
import { promise } from 'protractor';

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
  getWordInfo(language:string, word:string ):Promise<Word>{
    if (!language || ! word){
      return new Promise(null);
    }
    var promise = new Promise<Word>((resolve,reject) =>{
      this.http.get<Word>(`${environment.apiUrl}/lexicon/${language}/${word}`)
      .toPromise()
      .then(res =>{
        resolve(res);
      },
      msg=>{        
        reject(msg);
      })
    });
    return promise;
  }
}
