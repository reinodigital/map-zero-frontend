import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { AuthService, ClientService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';

import { formatDateToString } from '../../../../shared/helpers';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { EconomicActivitySelectComponent } from '../../../../shared/components/economic-activity-select/economic-activity-select.component';

import { IdentityType, TypeClient, TypeMessageToast } from '../../../../enums';
import {
  ShortAuth,
  IClientToUpdate,
  ISelectedActivity,
} from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'new-client',
  imports: [
    ReactiveFormsModule,
    NgSelectModule,
    EconomicActivitySelectComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss',
})
export default class NewClientComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private commonAdminService = inject(CommonAdminService);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);
  private router = inject(Router);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // FORM
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  public newClientForm = signal<FormGroup>(
    this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: [TypeClient.CLIENT, [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      mobile: [
        '',
        [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
      ],
      identity: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ],
      ],
      identityType: [IdentityType.JURIDICO, [Validators.required]],
      currency: ['USD', [Validators.required]],
      notes: ['', []],
      defaultSeller: [null, []],
      activities: [[], []],
    })
  );

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.fetchSellers();
  }

  fetchSellers(): void {
    this.authService.fetchAllSellers().subscribe((resp) => {
      if (resp && resp.length) {
        this.sellers.set(resp);
      }
    });
  }

  validField(field: string): boolean {
    return (
      this.newClientForm().controls[field].touched &&
      this.newClientForm().controls[field].invalid
    );
  }

  onEconomicActivityChange(event: ISelectedActivity[]): void {
    this.newClientForm().controls['activities'].patchValue(event);
  }

  onSubmit(): void {
    if (this.newClientForm().invalid) {
      this.formErrorService.throwFormErrors(this.newClientForm());

      return;
    }

    let data: IClientToUpdate | any = {};
    data.createdAt = formatDateToString(new Date());

    for (const key in this.newClientForm().value) {
      if (this.newClientForm().value.hasOwnProperty(key)) {
        const controlValue = this.newClientForm().controls[key].value;

        if (controlValue && key !== 'defaultSeller') {
          data[key] = controlValue;
        }

        if (controlValue && key === 'defaultSeller') {
          data[key] = controlValue.name;
        }
      }
    }

    this.clientService.create(data).subscribe((resp) => {
      if (resp && resp.msg) {
        this.customToastService.add({
          message: resp.msg,
          type: TypeMessageToast.SUCCESS,
          duration: 5000,
        });
        this.router.navigateByUrl('/list-clients');
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
  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-clients');
  }
}
