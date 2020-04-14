import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/Services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss']
})
export class FriendListComponent implements OnInit,OnDestroy {
  contacts: string[] = [];
  private contactsSubscription:Subscription;
  constructor(private userService:UserService) { 
    this.contactsSubscription = this.userService.getContacts().subscribe(c => {
      this.contacts = c;
    });
  }
  
  ngOnInit(): void {
       

  }

  ngOnDestroy(): void {
    this.contactsSubscription.unsubscribe();
  }

}
