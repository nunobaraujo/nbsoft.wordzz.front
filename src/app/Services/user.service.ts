import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Settings } from '../Models/settings';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserDetails } from '../Models/userDetails';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private currentUserSubject =  new BehaviorSubject<Settings>(null);
  private userSettings$ = this.currentUserSubject.asObservable();
  private userSettings:Settings = null;
  
  constructor(private http: HttpClient) 
  {
    
  } 
  
  loadSettings(){
    this.getSettings().subscribe(s => {
      this.userSettings = s;
      this.currentUserSubject.next(this.userSettings);
    });    
  }
  clearSettings(){
    this.userSettings = null;
  }
  settings():Observable<Settings>{
    if (this.userSettings == null){
      this.loadSettings();
    }
    return  this.userSettings$;
  }
  

  signUp(username: string, email:string ,password: string) {
    return this.http.post<any>(`${environment.apiUrl}/user`, { username, email, password })
        .pipe(map(user => {
            return user;
        }));
  }

  getDetails(){
    return this.http.get<any>(`${environment.apiUrl}/user/details`)
    .pipe(map(d => {      
      if (!d){
        return null;
      }
      let userDetails = new UserDetails();
      Object.assign(userDetails, d)
      return userDetails;
    }));
  }
  setDetails(userDetails:UserDetails){
    return this.http.put<UserDetails>(`${environment.apiUrl}/user/details`,userDetails)
    .pipe(map(d => {      
      if (!d){
        return null;
      }
      let userDetails = new UserDetails();
      Object.assign(userDetails, d)
      return userDetails;
    }));
  }

  getSettings(){
    return this.http.get<any>(`${environment.apiUrl}/user/settings/main`)
    .pipe(map(settings => {      
      if (!settings){
        return null;
      }
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
