import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TerritoryService } from '../../../api';
import { FormErrorService } from '../../services/form-error.service';

import { IDataToCreateNewClientAddress, ITerritory } from '../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-modal-client-address',
  templateUrl: './modal-client-address.component.html',
  styleUrls: ['./modal-client-address.component.scss'],
  imports: [ReactiveFormsModule],
  standalone: true,
})
export class ModalClientAddressComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private territoryService = inject(TerritoryService);
  private formErrorService = inject(FormErrorService);
  public dialogRef = inject(MatDialogRef<ModalClientAddressComponent>);

  // TERRITORIES
  public provinces = signal<ITerritory[]>([]);
  public cantons = signal<ITerritory[]>([]);
  public districts = signal<ITerritory[]>([]);

  public errMsg = signal<string>('');
  public addressForm = signal<FormGroup>(
    this.fb.group({
      province: [null, [Validators.required]],
      canton: [null, [Validators.required]],
      district: [null, [Validators.required]],
      exactAddress: [
        null,
        [Validators.minLength(8), Validators.maxLength(120)],
      ],
    })
  );

  ngOnInit(): void {
    this.fetchSevenProvinces();

    // Listen Province change
    this.addressForm()
      .controls['province'].valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((province: ITerritory) => {
        if (province) {
          this.fetchCantonsByProvinceId(province.id);
        }

        this.addressForm().controls['canton'].patchValue(null);
      });

    // Listen Canton change
    this.addressForm()
      .controls['canton'].valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((canton: ITerritory) => {
        if (canton) {
          this.fetchDistrictsByCantonId(canton.id);
        }

        this.addressForm().controls['district'].patchValue(null);
      });
  }

  closePopUp(resp: string | null = null) {
    this.dialogRef.close(resp);
  }

  validField(field: string) {
    return (
      this.addressForm().controls[field].touched &&
      this.addressForm().controls[field].invalid
    );
  }

  // FETCH 7 PROVINCES OF CR
  private fetchSevenProvinces(): void {
    this.territoryService
      .fetchProvinces()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.length) {
          this.provinces.set(resp);
        }
      });
  }

  // FETCH CANTONS BY PROVINCE ID
  private fetchCantonsByProvinceId(provinceId: number): void {
    this.territoryService
      .fetchCantonsByProvinceId(provinceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.length) {
          this.cantons.set(resp);
        }
      });
  }

  // FETCH DISTRICTS BY CANTON ID
  private fetchDistrictsByCantonId(cantonId: number): void {
    this.territoryService
      .fetchDistrictsByCantonId(cantonId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.length) {
          this.districts.set(resp);
        }
      });
  }

  saveAddress(): void {
    if (this.addressForm().invalid) {
      this.formErrorService.throwFormErrors(this.addressForm());

      return;
    }

    const { province, canton, district, exactAddress } =
      this.addressForm().value;

    const dataAddress: IDataToCreateNewClientAddress = {
      provinceName: province.name,
      provinceCode: province.code.toString(),
      cantonName: canton.name,
      cantonCode: canton.code.toString(),
      districtName: district.name,
      districtCode: district.code.toString(),
      exactAddress: exactAddress ?? null,
    };

    this.closePopUp(JSON.stringify(dataAddress));
  }
}
