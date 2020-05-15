import { Component, OnInit } from '@angular/core';
import { StatsService } from 'src/app/Services/stats.service';
import { UserStats } from 'src/app/Models/userStats';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-high-scores',
  templateUrl: './high-scores.component.html',
  styleUrls: ['./high-scores.component.scss']
})
export class HighScoresComponent implements OnInit {

  private statsSubscription:Subscription;

  highScores:UserStats[] = [];
  constructor(private statsService:StatsService) { 
    
  }

  ngOnInit(): void {
    if (!!this.statsSubscription){
      this.statsSubscription.unsubscribe();
    }
    this.statsSubscription = this.statsService.getStats().subscribe(hs => {
      this.highScores = hs;
      if (hs.length>5){
        this.highScores = hs.slice(0,5);
      }
    });
  }

}
