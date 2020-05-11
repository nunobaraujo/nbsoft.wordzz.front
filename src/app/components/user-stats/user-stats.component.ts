import { Component, OnInit, OnDestroy } from '@angular/core';
import { StatsService } from 'src/app/Services/stats.service';
import { UserStats } from 'src/app/Models/userStats';
import { AuthenticationService } from 'src/app/Services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-stats',
  templateUrl: './user-stats.component.html',
  styleUrls: ['./user-stats.component.scss']
})
export class UserStatsComponent implements OnInit , OnDestroy{
  statsSubscription: Subscription;
  stats:UserStats = null;
  constructor(statsService:StatsService, authService:AuthenticationService ) 
  {
    if (!!authService.currentUserValue){
      this.statsSubscription = statsService.getUserStats( authService.currentUserValue.username).subscribe(us =>{
        this.stats = us
      });
    }
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.statsSubscription.unsubscribe();
  }

}
