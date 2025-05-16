import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ClientAddressService, ClientContactService } from '../../../api';
import { CustomToastService } from '../../../shared/services/custom-toast.service';
import { ModalClientAddressComponent } from '../../../shared/modals/modal-client-address/modal-client-address.component';
import { ModalClientContactComponent } from '../../../shared/modals/modal-client-contact/modal-client-contact.component';
import { ModalConfirmComponent } from '../../../shared/modals/modal-confirm/modal-confirm.component';

import { TypeMessageToast } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class DetailClientService {
  private clientAddressService = inject(ClientAddressService);
  private clientContactService = inject(ClientContactService);
  private customToastService = inject(CustomToastService);
  private dialog = inject(MatDialog);

  // Using a Subject to emit when a new address is added
  private _newAddress$ = new Subject<void>();
  public newAddress$ = this._newAddress$.asObservable();

  addNewAddress(clientId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalClientAddressComponent, {
      width: '35rem',
      height: 'auto',
      autoFocus: false,
      data: null,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((address: string | null) => {
      if (address) {
        this.clientAddressService
          .create(clientId, JSON.parse(address))
          .subscribe((resp) => {
            if (resp && resp.msg) {
              this.customToastService.add({
                message: resp.msg,
                type: TypeMessageToast.SUCCESS,
                duration: 10000,
              });

              // Emit an event when a new address is successfully added
              this._newAddress$.next();
            } else {
              this.customToastService.add({
                message: resp.message,
                type: TypeMessageToast.ERROR,
                duration: 10000,
              });
            }
          });
      }
    });
  }

  removeAddress(addressId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '60rem',
      height: '20rem',
      autoFocus: false,
      data: `Estás seguro/a de que deseas eliminar esta dirección de cliente ?`,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((election: boolean) => {
      if (election) {
        this.clientAddressService.removeOne(addressId).subscribe((resp) => {
          if (resp && resp.msg) {
            this.customToastService.add({
              message: resp.msg,
              type: TypeMessageToast.SUCCESS,
              duration: 10000,
            });
            // Emit an event when a new address is successfully added
            this._newAddress$.next();
          } else {
            this.customToastService.add({
              message: resp.message,
              type: TypeMessageToast.ERROR,
              duration: 10000,
            });
          }
        });
      }
    });
  }

  addNewContact(clientId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalClientContactComponent, {
      width: '35rem',
      height: 'auto',
      autoFocus: false,
      data: null,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((contact: string | null) => {
      if (contact) {
        this.clientContactService
          .create(clientId, JSON.parse(contact))
          .subscribe((resp) => {
            if (resp && resp.msg) {
              this.customToastService.add({
                message: resp.msg,
                type: TypeMessageToast.SUCCESS,
                duration: 10000,
              });
              // Emit an event when a new address is successfully added
              this._newAddress$.next();
            } else {
              this.customToastService.add({
                message: resp.message,
                type: TypeMessageToast.ERROR,
                duration: 10000,
              });
            }
          });
      }
    });
  }

  removeContact(contactId: number): void {
    // Mat Dialog solution
    let dialogRef = this.dialog.open(ModalConfirmComponent, {
      width: '60rem',
      height: '20rem',
      autoFocus: false,
      data: `Estás seguro/a de que deseas eliminar este contacto de cliente ?`,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((election: boolean) => {
      if (election) {
        this.clientContactService.removeOne(contactId).subscribe((resp) => {
          if (resp && resp.msg) {
            this.customToastService.add({
              message: resp.msg,
              type: TypeMessageToast.SUCCESS,
              duration: 10000,
            });
            // Emit an event when a new address is successfully added
            this._newAddress$.next();
          } else {
            this.customToastService.add({
              message: resp.message,
              type: TypeMessageToast.ERROR,
              duration: 10000,
            });
          }
        });
      }
    });
  }
}
