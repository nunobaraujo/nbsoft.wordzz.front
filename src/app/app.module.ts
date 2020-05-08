import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { GameCenterModule }      from './components/game-center/game-center.module';

import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatComponent } from './components/chat/chat.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ModalComponent } from './Dialogs/modal/modal.component';
import { SelectLetterModalComponent } from './Dialogs/select-letter-modal/select-letter-modal.component';
import { AllowedLetterDirective } from './shared/allowed-letter.directive';
import { AddFriendModalComponent } from './Dialogs/add-friend-modal/add-friend-modal.component';
import { ChallengesReceivedComponent } from './components/challenges-received/challenges-received.component';
import { OngoingGamesComponent } from './components/ongoing-games/ongoing-games.component';
import { GameoverModalComponent } from './Dialogs/gameover-modal/gameover-modal.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SignupComponent,
    ChatComponent,
    FriendListComponent,
    SideMenuComponent,
    DashboardComponent,
    ModalComponent,
    SelectLetterModalComponent,
    AllowedLetterDirective,
    AddFriendModalComponent,
    ChallengesReceivedComponent,
    OngoingGamesComponent,
    GameoverModalComponent,
    UserStatsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,    
    GameCenterModule,
    AppRoutingModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  entryComponents: [ModalComponent,SelectLetterModalComponent,GameoverModalComponent]
})
export class AppModule { }
