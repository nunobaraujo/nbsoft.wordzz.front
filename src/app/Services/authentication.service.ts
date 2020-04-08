import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../Models/user';
import { Settings } from '../Models/settings';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    private currentUserSettingsSubject: BehaviorSubject<Settings>;
    public currentUserSettings: Observable<Settings>;

    constructor(private http: HttpClient, 
        private userService:UserService) 
    {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();

        this.currentUserSettingsSubject = new BehaviorSubject<Settings>(JSON.parse(localStorage.getItem('currentUserSettings')));
        this.currentUserSettings = this.currentUserSettingsSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }
    public get currentSettingsValue(): Settings {
        return this.currentUserSettingsSubject.value;
      }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/session/login`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);

                this.userService.getSettings().subscribe(settings=>{
                    localStorage.setItem('currentUserSettings', JSON.stringify(settings));
                    this.currentUserSettingsSubject.next(settings);
                    return user;
                });
                
            }));
    }

    logout() {
        // remove user from local storage to log user out        
        this.http.delete(`${environment.apiUrl}/session/login`).subscribe(res =>{                        
            console.log('logout');
        } );
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserSettings');
        this.currentUserSubject.next(null);
    }
}