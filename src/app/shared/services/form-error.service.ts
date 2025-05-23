import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormErrorService {
  markAllAsTouchedAndDirty(control: AbstractControl) {
    if (control instanceof FormGroup) {
      // If it's a FormGroup, iterate over its controls
      Object.keys(control.controls).forEach((field) => {
        const nestedControl = control.get(field);
        if (nestedControl) {
          // Recursively call the method for each nested control
          this.markAllAsTouchedAndDirty(nestedControl);
        }
      });
    } else if (control instanceof FormArray) {
      // If it's a FormArray, iterate over its items
      control.controls.forEach((nestedControl) => {
        // Recursively call the method for each item in the array
        this.markAllAsTouchedAndDirty(nestedControl);
      });
    } else if (control instanceof FormControl) {
      // If it's a FormControl, mark it as touched and dirty
      control.markAsTouched();
      control.markAsDirty();
      // Optionally, you might want to call updateValueAndValidity to re-evaluate validation immediately
      // control.updateValueAndValidity();
    }
  }

  // Mark all controls as touched and dirty
  throwFormErrors(form: FormGroup) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control) {
        this.markAllAsTouchedAndDirty(form);
      }
    });
  }
}
