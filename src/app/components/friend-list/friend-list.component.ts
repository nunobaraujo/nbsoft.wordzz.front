import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UserService } from 'src/app/Services/user.service';
import { GameService } from 'src/app/Services/game.service';
import { faUser,faTrophy,faUserSlash,faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { AddFriendModalComponent } from 'src/app/Dialogs/add-friend-modal/add-friend-modal.component';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Game } from 'src/app/Models/game';
import { Router } from '@angular/router';


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
  games:Game[];
  private contactsSubscription:Subscription;
  private socketsConnectedSubscription:Subscription;
  private onlineContactsSubscription:Subscription;
  private gameServiceConnectedSubscription:Subscription;
  private gameSubscription:Subscription;    

  constructor(private router:Router,
    private userService:UserService,
    private gameService:GameService,
    public dialog: MatDialog) 
  { 
      this.refreshContacts()

      this.gameServiceConnectedSubscription = this.gameService.isConnected$.subscribe(connected => {
        if (connected){          
          this.gameSubscription = this.gameService.getActiveGames().subscribe(g =>{ 
            this.games = g;            
          });
        }
        else{
          if (!!this.gameSubscription){
            this.gameSubscription.unsubscribe();
          }
        }      
      });
  }
  
  ngOnInit(): void {
    

  }

  ngOnDestroy(): void {
    this.killSubscriptions();
    this.gameServiceConnectedSubscription.unsubscribe();
  }

  onAddFriend($event): void {
    
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

  onRemoveFriend($event, username:string):void{
    var r = confirm(`Are you sure you want to remove ${username} from your frind list?` )
    if (r == true) {
      this.removeFriend(username);
    }
  }

  onStartGame($event, username:string):void{    
    let gameUrl:string = "/game-center/newgame/"+username;
    console.log('gameUrl :>> ', gameUrl);
    setTimeout(() => {
      this.router.navigateByUrl(gameUrl);  
    }, 100);
  }
  onGotoGame($event, username:string):void{    
    //console.log(this.games);    
    var game = this.getGameByUser(username);
    console.log(username,game);    
    if (!!game){
      let gameUrl:string = "/game-center/"+game.id;
      setTimeout(() => {
        this.router.navigateByUrl(gameUrl);  
      }, 100);
    }    
  }


  playerHasGame(username:string): boolean{
      if (!!this.games){
        var hasGame = this.getGameByUser(username);
        return !!hasGame;
      }
      return false;
  }

  private getGameByUser(username:string):Game{
    var game =   this.games.find(g => g.player01.userName === username ||  g.player02.userName === username);    
    return  game;
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
