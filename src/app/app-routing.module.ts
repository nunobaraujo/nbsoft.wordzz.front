import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './_helpers/auth.guard';
import { SignupComponent } from './components/signup/signup.component';
import { UserPageComponent } from './components/user-page/user-page.component';



const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'user', component: UserPageComponent, canActivate: [AuthGuard]  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },    
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
