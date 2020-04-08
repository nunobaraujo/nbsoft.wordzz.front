import { Component, OnInit } from '@angular/core';
import { Settings } from 'src/app/Models/settings';
import { AuthenticationService } from 'src/app/Services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userSettings:Settings;

  constructor(private authenticationService: AuthenticationService) { }


  ngOnInit(): void {
    this.userSettings = this.authenticationService.currentSettingsValue;
    console.log('this.userSettings :', this.userSettings);
  }

}
