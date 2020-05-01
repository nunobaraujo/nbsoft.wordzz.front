import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

interface Data{
  username: string;
}

@Component({
  selector: 'app-add-friend-modal',
  templateUrl: './add-friend-modal.component.html',
  styleUrls: ['./add-friend-modal.component.scss']
})
export class AddFriendModalComponent implements OnInit {
  addFriendForm: FormGroup;  

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<AddFriendModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Data) { }

  ngOnInit(): void {
    this.addFriendForm = this.formBuilder.group({
      username: ['', [Validators.required]],
    });
  }
  
  get f() { return this.addFriendForm.controls; }

  public save(){
    const {value, valid} = this.addFriendForm;    
    if(valid){        
        this.data = value;    
        this.dialogRef.close(this.data);
    }   
  }
  public cancel(){
    this.dialogRef.close();
  }
}
