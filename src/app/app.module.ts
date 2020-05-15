import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { GameCenterModule }      from './components/game-center/game-center.module';

import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

import { AllowedLetterDirective } from './shared/allowed-letter.directive';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SignupComponent } from './components/signup/signup.component';
import { ChatComponent } from './components/chat/chat.component';
import { FriendListComponent } from './components/friend-list/friend-list.component';
import { UserStatsComponent } from './components/user-stats/user-stats.component';

import { AddFriendModalComponent } from './Dialogs/add-friend-modal/add-friend-modal.component';
import { GameoverModalComponent } from './Dialogs/gameover-modal/gameover-modal.component';
import { ModalComponent } from './Dialogs/modal/modal.component';
import { SelectLetterModalComponent } from './Dialogs/select-letter-modal/select-letter-modal.component';
import { HighScoresComponent } from './components/high-scores/high-scores.component';
import { UserPageComponent } from './components/user-page/user-page.component';
import { UserPageDetailsComponent } from './components/user-page-details/user-page-details.component';
import { UserPageSettingsComponent } from './components/user-page-settings/user-page-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SignupComponent,
    ChatComponent,
    FriendListComponent,
    ModalComponent,
    SelectLetterModalComponent,
    AllowedLetterDirective,
    UserStatsComponent,
    AddFriendModalComponent,
    GameoverModalComponent,
    HighScoresComponent,    
    UserPageComponent,
    UserPageDetailsComponent,
    UserPageSettingsComponent    
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
