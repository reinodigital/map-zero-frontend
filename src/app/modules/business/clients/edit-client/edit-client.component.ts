import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

import { AuthService, ClientService } from '../../../../api';
import { CustomToastService } from '../../../../shared/services/custom-toast.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { FormErrorService } from '../../../../shared/services/form-error.service';
import { formatDateToString } from '../../../../shared/helpers';

import { TypeMessageToast } from '../../../../enums';
import { IClient, ShortAuth, IClientToUpdate } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'edit-client',
  imports: [ReactiveFormsModule, NgSelectModule],
  templateUrl: './edit-client.component.html',
  styleUrl: './edit-client.component.scss',
})
export default class EditClientComponent {
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private commonAdminService = inject(CommonAdminService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private formErrorService = inject(FormErrorService);
  private customToastService = inject(CustomToastService);

  // DATA CLIENT
  public clientId!: number;
  public client = signal<IClient | null>(null);

  // SELLERS
  public sellers = signal<ShortAuth[]>([]);

  // FORM
  public emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  public editClientForm = signal<FormGroup | null>(null);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    this.clientId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchClient();
  }

  fetchClient(): void {
    this.clientService.fetchOne(this.clientId).subscribe((resp) => {
      if (resp && resp.id) {
        this.client.set(resp);
        this.fetchSellers();
      }
    });
  }

  fetchSellers(): void {
    this.authService.fetchAllSellers().subscribe((resp) => {
      if (resp && resp.length) {
        this.sellers.set(resp);
        const selectedSeller =
          this.sellers().find(
            (seller) => seller.name === this.client()?.defaultSeller
          ) || null;
        this.fillOutClientForm(selectedSeller?.name ?? null);
      }
    });
  }

  fillOutClientForm(defaultSellerObject: string | null): void {
    this.editClientForm.set(
      this.fb.group({
        name: [
          this.client()?.name ?? '',
          [Validators.required, Validators.minLength(2)],
        ],
        email: [
          this.client()?.email ?? '',
          [Validators.required, Validators.pattern(this.emailPattern)],
        ],
        mobile: [
          this.client()?.mobile ?? '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(8),
          ],
        ],
        identity: [
          this.client()?.identity ?? '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(12),
          ],
        ],
        identityType: [this.client()?.identityType, [Validators.required]],
        currency: [this.client()?.currency ?? 'USD', [Validators.required]],
        notes: [this.client()?.notes ?? '', []],
        defaultSeller: [defaultSellerObject, []],
      })
    );
  }

  validField(field: string): boolean {
    return (
      this.editClientForm()!.controls[field].touched &&
      this.editClientForm()!.controls[field].invalid
    );
  }

  onSubmit(): void {
    if (this.editClientForm()?.invalid) {
      this.formErrorService.throwFormErrors(this.editClientForm()!);

      return;
    }

    let data: IClientToUpdate | any = {};
    data.updatedAt = formatDateToString(new Date());

    for (const key in this.editClientForm()?.value) {
      if (this.editClientForm()?.value.hasOwnProperty(key)) {
        const control = this.editClientForm()!.controls[key];
        const controlValue = control.value;

        if (control) {
          data[key] = controlValue;
        }

        if (!controlValue && key === 'defaultSeller') {
          data[key] = null;
        }
      }
    }

    this.clientService.update(this.clientId, data).subscribe((resp) => {
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
