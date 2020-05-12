import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { faUser,faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { AuthenticationService } from './Services/authentication.service';

import { User } from './Models/user';
import { GameService } from './Services/game.service';
import { GameHub } from './Managers/gameHub';


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
    private gameHub: GameHub,
    gameService: GameService)
  {
    this.socketsConnectedSubscription = this.gameHub.isConnected$.subscribe(c => {      
      if (c == true){   
        console.log('Connected!');
        this.connecting = false;        
      }
      else{
        this.connecting = true;
        console.log('Disconnected!');
      }
    });

    this.authenticationService.currentUser.subscribe(x => {      
      this.currentUser = x;
      if (!!this.currentUser){
        gameService.refreshGames()
          .then(gms =>{ 
            console.log('Loaded Games :>> ', gms);
            gameHub.connect();                 
          })
          .catch(err =>{
            console.log('err >', err);
            gameHub.disconnect();
          });         
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
