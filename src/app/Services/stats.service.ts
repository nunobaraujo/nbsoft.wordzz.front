import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserStats } from '../Models/userStats';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(private http: HttpClient) { }

  getStats(){
    return this.http.get<UserStats[]>(`${environment.apiUrl}/stats`)
    .pipe(map(stats => {      
      let retval:UserStats[] = [];
      Object.assign(retval, stats)
      return retval;
    }));
  }
  getUserStats(userName:string){
    return this.http.get<UserStats>(`${environment.apiUrl}/stats/${userName}`)
    .pipe(map(stats => {      
      let retval:UserStats = new UserStats();
      Object.assign(retval, stats)
      return retval;
    }));
  }
  
}
