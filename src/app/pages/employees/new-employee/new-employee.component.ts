import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { FormErrorService } from '../../../shared/services/form-error.service';
import { CustomToastService } from '../../../shared/services/custom-toast.service';

import { AuthService } from '../../../api';
import { SecurityRoles, TypeMessageToast } from '../../../enums';
import { IAuthToSignUp } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'new-employee',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-employee.component.html',
  styleUrl: './new-employee.component.scss',
})
export default class NewEmployeeComponent {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private authService = inject(AuthService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);
  private router = inject(Router);

  public allowedRoles: string[] = [
    SecurityRoles.ADMIN,
    SecurityRoles.ADMINISTRATIVE_ASSISTANT,
    SecurityRoles.SELLER,
    SecurityRoles.ACCOUNTANT,
  ];

  // FORM
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  public newEmployeeForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      mobile: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
      ],
      rol: [SecurityRoles.SELLER, [Validators.required]],
    })
  );

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  validField(field: string): boolean {
    return (
      this.newEmployeeForm().controls[field].touched &&
      this.newEmployeeForm().controls[field].invalid
    );
  }

  // Redirect to list, but if filters applies then keep them
  comeBackToList(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/employees');
    }
  }

  onSubmit(): void {
    if (this.newEmployeeForm().invalid) {
      this.formErrorService.throwFormErrors(this.newEmployeeForm());

      return;
    }

    let data: IAuthToSignUp | any = {};

    for (const key in this.newEmployeeForm().value) {
      if (this.newEmployeeForm().value.hasOwnProperty(key)) {
        const controlValue = this.newEmployeeForm().controls[key].value;

        if (controlValue) {
          if (key === 'rol') {
            data['roles'] = [controlValue];
          } else {
            data[key] = controlValue;
          }
        }
      }
    }

    this.authService.register(data).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });
        this.router.navigateByUrl('/employees');
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 5000,
        });
      }
    });
  }

  // --------- HELPERS ----------
  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
    // return true => There is a back URL
    // return false => There is no back URL or it's the initial navigation
  }
}
