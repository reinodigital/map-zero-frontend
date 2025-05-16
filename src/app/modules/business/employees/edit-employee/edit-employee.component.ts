import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';

import { SecurityRoles, TypeMessageToast } from '../../../../enums';
import { IAuth, IAuthToUpdate } from '../../../../interfaces';

@Component({
  selector: 'edit-employee',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
})
export default class EditEmployeeComponent {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private activatedRoute = inject(ActivatedRoute);
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

  // DATA EMPLOYEE
  public employeeId!: number;
  public employee = signal<IAuth | null>(null);

  // FORM
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  public editEmployeeForm = signal<FormGroup | null>(null);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    this.employeeId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchEmployeeById();
  }

  private fetchEmployeeById(): void {
    this.authService.fetchOne(this.employeeId).subscribe((resp) => {
      if (resp && resp.uid) {
        this.employee.set(resp);
        this.fillOutForm();
      }
    });
  }

  fillOutForm(): void {
    this.editEmployeeForm.set(
      this.fb.group({
        name: [
          this.employee()?.name ?? '',
          [Validators.required, Validators.minLength(2)],
        ],
        email: [
          this.employee()?.email ?? '',
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        mobile: [
          this.employee()?.mobile ?? '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(8),
          ],
        ],
        rol: [this.employee()?.roles[0], [Validators.required]],
      })
    );
  }

  validField(field: string): boolean {
    return (
      this.editEmployeeForm()!.controls[field].touched &&
      this.editEmployeeForm()!.controls[field].invalid
    );
  }

  onSubmit(): void {
    if (this.editEmployeeForm()?.invalid) {
      this.formErrorService.throwFormErrors(this.editEmployeeForm()!);

      return;
    }

    let data: IAuthToUpdate | any = {};

    for (const key in this.editEmployeeForm()?.value) {
      if (this.editEmployeeForm()?.value.hasOwnProperty(key)) {
        const controlValue = this.editEmployeeForm()?.controls[key].value;

        if (controlValue) {
          if (key === 'rol') {
            data['roles'] = [controlValue];
          } else {
            data[key] = controlValue;
          }
        }
      }
    }

    this.authService.update(this.employeeId, data).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 10000,
        });
        this.router.navigateByUrl('/list-employees');
      } else {
        this.customToastService.add({
          message: resp.message,
          type: TypeMessageToast.ERROR,
          duration: 10000,
        });
      }
    });
  }

  // --------- HELPERS ----------
  // Redirect to list, but if filters applies then keep them
  comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-employees');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
