import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/Services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  created:string=null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService:UserService)
  {
    
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required,Validators.minLength(6)]],
      email: ['', Validators.required],
      password: ['', [Validators.required,Validators.minLength(8)]]
  });

  // get return url from route parameters or default to '/'
  this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      console.log('object :>> ', this.loginForm.errors);
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
              }
            },
            error => {
                this.error = error;
                this.loading = false;
            });
  }
}
