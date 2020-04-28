import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

  constructor(public dialogRef: MatDialogRef<SelectLetterModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectLetterData) { }

  ngOnInit(): void {
  }

}
