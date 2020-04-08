import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './Services/authentication.service';
import { User } from './Models/user';
import { Settings } from './Models/settings';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wordzz-front';
  currentUser: User;
  currentSettings: Settings;

  constructor(private router: Router,
    private authenticationService: AuthenticationService)
  {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.authenticationService.currentUserSettings.subscribe(x => this.currentSettings = x);

    
  }
  logout() {
    this.authenticationService.logout();    
    localStorage.removeItem('currentUserSettings');
    this.router.navigate(['/login']);
}
}
