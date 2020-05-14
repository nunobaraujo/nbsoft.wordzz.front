import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../Models/user';
import { UserService } from './user.service';
import { settings } from 'cluster';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;   
            
    constructor(private http: HttpClient) 
    {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }  

    login(username: string, password: string):Observable<User> {
        return this.http.post<any>(`${environment.apiUrl}/session`, { username, password })
            .pipe(map(user => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                console.log('Logged in');
                return user;                
            }));
    }

    logout() {
        let current = localStorage.getItem('currentUser');
        localStorage.removeItem('currentUser');        
        this.currentUserSubject.next(null);        
        // remove user from local storage to log user out
        console.log("Logged out")
        if (!!current)   {
            this.http.delete(`${environment.apiUrl}/session`).subscribe(() => {
            });
        }
    }
}