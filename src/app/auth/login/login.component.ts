import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../../api';
import { CustomToastService } from '../../shared/services/custom-toast.service';
import { TypeMessageToast } from '../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule],
  standalone: true,
})
export default class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private customToastService = inject(CustomToastService);

  // FORM
  public passwordType = signal<string>('password');
  public loginForm = signal<FormGroup>(
    this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  );

  // Placeholder
  public sub: Subscription = new Subscription();

  isInvalidField(field: string) {
    return (
      this.loginForm().controls[field].touched &&
      this.loginForm().controls[field].invalid
    );
  }

  formErrors(field: string) {
    return this.loginForm().get(field)?.errors;
  }

  displayPassword(): void {
    this.passwordType() === 'password'
      ? this.passwordType.set('text')
      : this.passwordType.set('password');
  }

  login(): void {
    if (this.loginForm().valid) {
      this.authService.login(this.loginForm().value).subscribe((resp) => {
        if (resp && resp.uid) {
          this.customToastService.add({
            message: `Bienvenido/a a Map Zero ${resp.name}`,
            type: TypeMessageToast.SUCCESS,
            duration: 3000,
          });
          this.router.navigateByUrl('/');
        } else {
          this.customToastService.add({
            message: resp.message,
            type: TypeMessageToast.ERROR,
            duration: 10000,
          });
        }
      });
    } else {
      this.loginForm().markAllAsTouched();
    }
  }
}
