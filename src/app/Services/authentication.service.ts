import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
                console.log('Logged in');
                this.userService.getSettings().subscribe(settings=>{
                    localStorage.setItem('currentUserSettings', JSON.stringify(settings));
                    this.currentUserSettingsSubject.next(settings);
                    return user;
                });
                
            }));
    }

    logout() {
        // remove user from local storage to log user out     
        if (!!localStorage.getItem('currentUser'))   {
            this.http.delete(`${environment.apiUrl}/session/login`)            
            .pipe(                            
                catchError(this.handleError)
            )
        }
        
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserSettings');
        this.currentUserSubject.next(null);
        console.log('logged out');
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(
            `Backend returned code ${error.status}, ` +
            `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
          'Something bad happened; please try again later.');
      };
}