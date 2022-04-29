import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/Services/user.service';
import { CustomValidators } from 'src/app/Providers/CustomValidators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  created:string=null;

  loginForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    },

    CustomValidators.mustMatch('password', 'confirmPassword') // insert here
  );


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService:UserService)
  {
    
  }

  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('Invalid: object :>> ', this.loginForm.errors);
        return;
    }

    this.loading = true;
    this.userService.signUp(this.f.username.value,this.f.email.value, this.f.password.value)
        .pipe(first())
        .subscribe(
            data => {
              if (!!data){
                console.log('data :>> ', data);
                this.created= `User ${data.userName} created successfully`;
                console.log('text :>> ', this.created);
                setTimeout(() =>{                  
                  this.router.navigate(['/login']);
                }          
                ,5000);                
              }
            },
            error => {
                this.error = error;
                this.loading = false;
            });
  }
}
