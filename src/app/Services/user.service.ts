import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  

  constructor(private http: HttpClient) 
  {
    
  } 



  signUp(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/user/create`, { username, password })
        .pipe(map(user => {
            return user;
        }));
  }
  getSettings(){
    return this.http.get<any>(`${environment.apiUrl}/user/mainsettings`)
    .pipe(map(settings => {      
      return settings;
  }));
  }

}
