import { Directive } from '@angular/core';
import { ValidatorFn, AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appAllowedLetter]'
})
export class AllowedLetterDirective {

  constructor() { }

  
  

}
export function allowedLetterValidator(allLetters: string[]): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const forbidden = allLetters.findIndex(l => l === control.value.toLocaleUpperCase()) === -1;       
    return forbidden ? {'forbiddenLetter': {value: control.value}} : null;
  };
}