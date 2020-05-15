import { Component, OnInit, OnDestroy } from '@angular/core';
import { Lexicon } from 'src/app/Models/lexicon';
import { Board } from 'src/app/Models/board';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/Services/user.service';
import { BoardService } from 'src/app/Services/board.service';
import { LexiconService } from 'src/app/Services/lexicon.service';
import { Settings } from 'src/app/Models/settings';

@Component({
  selector: 'app-user-page-settings',
  templateUrl: './user-page-settings.component.html',
  styleUrls: ['./user-page-settings.component.scss']
})
export class UserPageSettingsComponent implements OnInit, OnDestroy {
  private boardSubscription:Subscription;
  private settingsSubscription:Subscription;
  private lexiconSubscription:Subscription;
  private originalValue:string;
  mainSettings:Settings;  
  availableLexicons:Lexicon[];
  availableBoards:Board[];
  
  
  constructor(private userService:UserService, private boardService:BoardService, private lexiconService:LexiconService) { 
    this.settingsSubscription = userService.settings().subscribe(s => {      
      this.mainSettings = s;
      this.originalValue = JSON.stringify(s);
      this.lexiconSubscription = lexiconService.getLexicons().subscribe(ls => {
        this.availableLexicons = ls;
      });
      this.boardSubscription = boardService.getBoards().subscribe(bs =>{
        this.availableBoards = bs;        
      });
    });
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {    
    this.settingsSubscription.unsubscribe();
    if (!!this.lexiconSubscription){
      this.lexiconSubscription.unsubscribe();
    }
    if (!!this.boardSubscription){
      this.boardSubscription.unsubscribe();
    }
  }

  onSubmit() { 
    /*this.userService.setDetails(this.userDetails).subscribe(d => {
      if (!!d){
        this.originalValue = JSON.stringify(d);
        this.userDetails = d;
      }      
    });*/
  }

  get diagnostic() { return JSON.stringify(this.mainSettings); }
  get hasChanges(){return this.diagnostic !=  this.originalValue;}

}
