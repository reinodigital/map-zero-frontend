import { Injectable, signal } from '@angular/core';
import { TypeClient } from '../../../enums';

@Injectable({
  providedIn: 'root',
})
export class ListClientsService {
  public lastOffsetListClients = signal<number>(0);

  public getIdentityType(code: string): string {
    let type: string = '';
    switch (code) {
      case '01':
        type = 'Fisico';
        break;
      case '02':
        type = 'Juridico';
        break;
      case '03':
        type = 'DIMEX';
        break;
      case '04':
        type = 'NITE';
        break;

      default:
        type = 'Juridico';
        break;
    }

    return type;
  }

  public getClientContactTypeBadge(typeClientContact: string): string {
    return typeClientContact === TypeClient.PROVIDER
      ? 'badge bg-label-primary'
      : 'badge bg-label-success';
  }
}
