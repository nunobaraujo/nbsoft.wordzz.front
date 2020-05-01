import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UserService } from 'src/app/Services/user.service';
import { GameService } from 'src/app/Services/game.service';
import { faUser,faTrophy,faUserSlash,faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { AddFriendModalComponent } from 'src/app/Dialogs/add-friend-modal/add-friend-modal.component';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss']
})
export class FriendListComponent implements OnInit,OnDestroy {  
  faUser = faUser;
  faTrophy = faTrophy;
  faUserSlash = faUserSlash;
  faUserFriends = faUserFriends;
  
  contacts: string[] =[];
  onlineContacts: string[];
  offlineContacts: string[];
  private contactsSubscription:Subscription;
  private socketsConnectedSubscription:Subscription;
  private onlineContactsSubscription:Subscription;
  constructor(private userService:UserService,
    private gameService:GameService,
    public dialog: MatDialog) 
  { 
      this.refreshContacts()
  }
  
  ngOnInit(): void {
    

  }

  ngOnDestroy(): void {
    this.killSubscriptions();
  }

  openAddFriendDialog($event): void {
    
    const dialogRef = this.dialog.open(AddFriendModalComponent, {
      width: '300px',
      data: {  "username" : ""}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.addFriend(result.username);
      }
    });
  }
  confirmRemoveFriend($event, username:string):void{
    var r = confirm(`Are you sure you want to remove ${username} from your frind list?` )
    if (r == true) {
      this.removeFriend(username);
    }
  }

  private refreshContacts(){
   
    console.log('refresh contacts!');

    this.contactsSubscription = this.userService.getContacts()
        .subscribe(c => {
          this.contacts = c;
          
          // after all contacts are received start socket subscription
          this.socketsConnectedSubscription = this.gameService.isConnected$.subscribe(c => {
            if (c == true){              
              this.onlineContactsSubscription = this.gameService.onlineFriends$.subscribe(o => {
                this.onlineContacts = o;
                this.offlineContacts = this.contacts.filter(x => !this.isOnline(x));                
              });
            }
            else{              
              if (!!this.onlineContactsSubscription)
              {
                this.onlineContactsSubscription.unsubscribe();
              }
            }
          });
        });
  }
  private killSubscriptions(){
    this.contactsSubscription.unsubscribe();
    this.socketsConnectedSubscription.unsubscribe();
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

  private addFriend(username: string){
    if (this.contacts.findIndex(c => c == username)>-1){
      alert(`${username} is already in your contact list`);
      return;
    }    
    var res = this.userService.addContact(username)
      .pipe( catchError(this.handleAddContactError))    
      .subscribe(u =>{
        if (u == true){
          console.log('contact added :>> ', u);
          this.killSubscriptions();
          this.refreshContacts();
          this.gameService.updateOnlineContacts();
        }         
      });    
  }
  private removeFriend(username: string){
    if (this.contacts.findIndex(c => c == username)===-1){
      alert(`${username} is not in your contact list`);
      return;
    }    
    var res = this.userService.deleteContact(username).
      subscribe(u =>{
        if (u == true){
          console.log('contact removed :>> ', u);
          this.killSubscriptions();
          this.refreshContacts();
          this.gameService.updateOnlineContacts();
        }
      });    
  }

  private handleAddContactError(error: HttpErrorResponse) {
    alert('Operation failed\n' + error);
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      /*console.error(        
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);*/
    }
    // return an observable with a user-facing error message
    return throwError(error);
  };
}
