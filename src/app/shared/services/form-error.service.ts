import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormErrorService {
  // Mark all controls as touched and dirty
  throwFormErrors(form: FormGroup) {
    Object.keys(form.controls).forEach((field) => {
      const control = form.get(field);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
      }
    });
  }
}
