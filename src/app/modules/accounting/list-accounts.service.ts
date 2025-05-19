import { inject, Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';

import { ModalNewAccountTypeComponent } from '../../shared/modals/modal-new-account-type/modal-new-account-type.component';
import { ModalCreateUpdateAccountComponent } from '../../shared/modals/modal-create-update-account/modal-create-update-account.component';
import { AccountTypeCategory } from '../../enums';
import { IAccount, IDataModalAccountForm } from '../../interfaces';
import { IPayloadAccountForm } from '../../interfaces/account.interface';

@Injectable({
  providedIn: 'root',
})
export class ListAccountsService {
  private dialogRef = inject(MatDialog);
  public lastOffsetListAccounts = signal<number>(0);

  private _newAccountType$ = new Subject<void>();
  public newAccountType$ = this._newAccountType$.asObservable();

  private _newAccount$ = new Subject<void>();
  public newAccount$ = this._newAccount$.asObservable();

  displayModalAddAccountType(): void {
    // Mat Dialog solution
    let dialogRef = this.dialogRef.open(ModalNewAccountTypeComponent, {
      width: '35rem',
      height: 'auto',
      autoFocus: false,
      data: null,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        // new account type was added correctly
        this._newAccountType$.next();
      }
    });
  }

  displayModalCreateOrUpdateAccount(account: IAccount | null = null): void {
    const data: IDataModalAccountForm = {
      id: account?.id ?? null,
      account: account
        ? {
            accountTypeId: account.accountType.id,
            name: account.name,
            code: account.code,
            description: account.description ?? null,
            tax: account.tax ?? null,
          }
        : null,
    };

    // Mat Dialog solution
    let dialogRef = this.dialogRef.open(ModalCreateUpdateAccountComponent, {
      width: '50rem',
      height: 'auto',
      autoFocus: false,
      data,
    });

    dialogRef.updatePosition({ top: '100px' });
    dialogRef.afterClosed().subscribe((resp) => {
      if (resp) {
        // new account was added correctly
        this._newAccount$.next();
      }
    });
  }

  getBadgeByCategory(category: string): string {
    let result = 'badge bg-label-warning';

    switch (category) {
      case AccountTypeCategory.ASSETS:
        result = 'badge bg-label-premium';
        break;
      case AccountTypeCategory.EQUITY:
        result = 'badge bg-label-primary';
        break;
      case AccountTypeCategory.EXPENSES:
        result = 'badge bg-label-danger';
        break;
      case AccountTypeCategory.LIABILITIES:
        result = 'badge bg-label-light';
        break;
      case AccountTypeCategory.REVENUE:
        result = 'badge bg-label-success';
        break;

      default:
        break;
    }

    return result;
  }
}
