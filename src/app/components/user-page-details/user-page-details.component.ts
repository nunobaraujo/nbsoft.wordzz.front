import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserDetails } from 'src/app/Models/userDetails';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-user-page-details',
  templateUrl: './user-page-details.component.html',
  styleUrls: ['./user-page-details.component.scss']
})
export class UserPageDetailsComponent implements OnInit, OnDestroy {
  private userDetailsSubscription:Subscription;
  
  private originalValue:string;
  userDetails: UserDetails;
  
  constructor(private userService:UserService) { 
    this.userDetailsSubscription = userService.getDetails().subscribe(d => {
      this.originalValue = JSON.stringify(d);
      this.userDetails = d;

    });
  }  
  ngOnInit(): void {
    
  }
  ngOnDestroy(): void {
    this.userDetailsSubscription.unsubscribe();
  }

  

  onSubmit() { 
    this.userService.setDetails(this.userDetails).subscribe(d => {
      if (!!d){
        this.originalValue = JSON.stringify(d);
        this.userDetails = d;
      }      
    });
  }
  
  get diagnostic() { return JSON.stringify(this.userDetails); }
  get hasChanges(){return this.diagnostic !=  this.originalValue;}

}
