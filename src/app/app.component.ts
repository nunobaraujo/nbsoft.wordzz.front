import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { AuthenticationService } from './Services/authentication.service';
import { GameService } from './Services/game.service';

import { User } from './Models/user';
import { UserService } from './Services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit, OnDestroy{
  title = 'wordzz-front';  
  currentUser: User;
  onlineContacts:Observable<string[]>;
  connecting: boolean= true;
  
  private socketsConnectedSubscription:Subscription;
  private challengeReceivedSubscription:Subscription;
  
  constructor(private router: Router,    
    private authenticationService: AuthenticationService,
    private gameService:GameService)
  {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    
    this.socketsConnectedSubscription = this.gameService.isConnected$.subscribe(c => {      
      if (c == true){   
        console.log('Connected!');        
        this.connecting = false;
        this.onlineContacts = this.gameService.onlineFriends$;
        this.challengeReceivedSubscription = this.gameService.lastReceivedChallenge$.subscribe(res => {
          if (!!res){                        
            let txt:string  = "You received a challenge from "+res.challenger+"!\nDo you accept the challenge?";            
            var accepted = confirm(txt);
            if (accepted) {
              this.router.navigateByUrl("/game-center/challenges")
            }            
          }
        });        
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
    if (!!this.challengeReceivedSubscription){
      this.challengeReceivedSubscription.unsubscribe();
    }
  }
  logout() {
    this.authenticationService.logout();
    setTimeout(() => {
      console.log("Going Home");
      this.router.navigateByUrl('/login');  
    }, 500);
    
}
}
