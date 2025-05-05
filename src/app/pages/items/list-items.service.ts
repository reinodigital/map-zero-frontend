import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListItemsService {
  public lastOffsetItemsList = signal<number>(0);

  getTariffTextIva(code: string): string {
    let result = '';

    switch (code) {
      case '01':
        result = 'Tarifa 0% (Artículo 32, num 1, RLIVA)';
        break;

      case '02':
        result = 'Tarifa reducida 1%';
        break;

      case '03':
        result = 'Tarifa reducida 2%';
        break;

      case '04':
        result = 'Tarifa reducida 4%';
        break;

      case '05':
        result = 'Transitorio 0%';
        break;

      case '06':
        result = 'Transitorio 4%';
        break;

      case '07':
        result = 'Tarifa transitoria 8%';
        break;

      case '08':
        result = 'Tarifa general 13%';
        break;

      case '09':
        result = 'Tarifa reducida 0.5%';
        break;

      case '10':
        result = 'Tarifa Exenta';
        break;

      case '11':
        result = 'Tarifa 0% sin derecho a crédito';
        break;

      default:
        break;
    }

    return result;
  }
}
