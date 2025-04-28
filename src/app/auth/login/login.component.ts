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

  // FORM
  public loginForm = signal<FormGroup>(
    this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  );

  // Placeholder
  public sub: Subscription = new Subscription();

  validField(field: string) {
    return (
      this.loginForm().controls[field].touched &&
      this.loginForm().controls[field].invalid
    );
  }

  login(): void {
    if (this.loginForm().invalid) return;

    this.authService.login(this.loginForm().value).subscribe((resp) => {
      resp && resp.uid ? this.router.navigateByUrl('/') : ''; // TODO: implement messages toast
    });
  }
}
