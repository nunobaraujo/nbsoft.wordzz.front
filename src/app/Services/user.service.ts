import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Settings } from '../Models/settings';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  

  constructor(private http: HttpClient) 
  {
    
  } 



  signUp(username: string, email:string ,password: string) {
    return this.http.post<any>(`${environment.apiUrl}/user`, { username, email, password })
        .pipe(map(user => {
            return user;
        }));
  }
  getSettings(){
    return this.http.get<any>(`${environment.apiUrl}/user/settings/main`)
    .pipe(map(settings => {      
      let s = new Settings();
      Object.assign(s, settings)
      return s;
    }));
  }
  setSettings(settings:Settings){
    return this.http.put<any>(`${environment.apiUrl}/user/settings/main`,settings)
    .pipe(map(settings => {      
      return settings;
    }));
  }

  getContacts(){
    return this.http.get<any>(`${environment.apiUrl}/user/contact`)
      .pipe(map(contacts => contacts));
  } 

  addContact(userName:string ){
    let email :string ="noemail";
    return this.http.post<any>(`${environment.apiUrl}/user/contact`, { userName,  email })
      .pipe(map(added =>{ return added;}));
  }
  deleteContact(userName:string ){
    let httpParams = new HttpParams().set('userName', userName);        
    let options = { params: httpParams };
    return this.http.delete<any>(`${environment.apiUrl}/user/contact`, options)
      .pipe(map(added => added));
  }
}
