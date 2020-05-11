import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { faUser,faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { AuthenticationService } from './Services/authentication.service';
import { GameHub } from './Managers/gameHub';

import { User } from './Models/user';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit, OnDestroy{
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;
  title = 'wordzz-front';  
  currentUser: User;
  connecting: boolean= true;
  userName:string;
  
  private socketsConnectedSubscription:Subscription;
  
  
  constructor(private router: Router,    
    private authenticationService: AuthenticationService,
    private gameHub:GameHub)
  {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    gameHub.getActiveGames().subscribe(gms => {
      console.log('Loaded Games :>> ', gms);
    });
    
    this.socketsConnectedSubscription = this.gameHub.isConnected$.subscribe(c => {      
      if (c == true){   
        console.log('Connected!');
        this.connecting = false;        
      }
      else{
        this.connecting = true;
        console.log('Not connected!');        
      }
    });

    
  }
  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.socketsConnectedSubscription.unsubscribe();    
  }
  logout() {
    this.authenticationService.logout();    
    this.router.navigateByUrl('/login');
  }
}
