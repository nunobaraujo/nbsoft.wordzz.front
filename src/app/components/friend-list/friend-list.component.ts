import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/Services/user.service';
import { GameService } from 'src/app/Services/game.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss']
})
export class FriendListComponent implements OnInit,OnDestroy {
  allContacts: string[] = [];
  onlineContacts: string[] = [];
  offlineContacts: string[] = [];
  private contactsSubscription:Subscription;
  private onlineContactsSubscription:Subscription;
  constructor(private userService:UserService,
    private gameService:GameService) 
  { 
      this.contactsSubscription = this.userService.getContacts()
        .subscribe(c => this.allContacts = c);    
    
      this.gameService.isConnected.subscribe(c => {
        if (c == true){
          this.onlineContactsSubscription = this.gameService.onlineFriends.subscribe(o => {
            this.onlineContacts = o;
            this.offlineContacts = this.allContacts.filter(x => this.isOnline(x));
          });
        }
        else{
          if (!!this.onlineContactsSubscription)
          {
            this.onlineContactsSubscription.unsubscribe();
          }
        }
        

      });

      
  }
  
  ngOnInit(): void {
    

  }

  ngOnDestroy(): void {
    this.contactsSubscription.unsubscribe();
    if (!!this.onlineContactsSubscription)
    {
      this.onlineContactsSubscription.unsubscribe();
    }
  }
  
  private isOnline(name: string):boolean{
    const index: number = this.onlineContacts.indexOf(name);
    if (index !== -1) {
      return true;
    }
    return false;
  }
}
