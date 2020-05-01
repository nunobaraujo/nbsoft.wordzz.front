import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { allowedLetterValidator } from 'src/app/shared/allowed-letter.directive';

interface SelectLetterData{
  availableLetters: string[];
  selectedLetter:string;
}

@Component({
  selector: 'app-select-letter-modal',
  templateUrl: './select-letter-modal.component.html',
  styleUrls: ['./select-letter-modal.component.scss']
})
export class SelectLetterModalComponent implements OnInit {
  blankLetterForm: FormGroup;  

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<SelectLetterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectLetterData) { }

  ngOnInit(): void {
    this.blankLetterForm = this.formBuilder.group({
      letter: ['', [Validators.required, Validators.maxLength(1), allowedLetterValidator(this.data.availableLetters)]],
    });
  }
 
  get f() { return this.blankLetterForm.controls; }

  public save(){
    const {value, valid} = this.blankLetterForm;    
    const res:string = value.letter;    

    if(valid){        
        this.dialogRef.close(res.toUpperCase());
    }   
  }


}
