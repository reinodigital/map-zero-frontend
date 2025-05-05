import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';
import { formatDateToString } from '../shared/helpers';

import { LS } from '../enums';
import { IDataToCreateNewClientAddress, IMessage } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ClientAddressService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = environment.baseUrl;
  private url = `${this._baseUrl}/client-address`;

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get getToken() {
    if (this.isBrowser) {
      const token = localStorage.getItem(LS.LS_TOKEN_SYSTEM) || '';
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    return new HttpHeaders().set('Authorization', `Bearer `);
  }

  create(
    clientId: number,
    dataAddress: IDataToCreateNewClientAddress
  ): Observable<IMessage | any> {
    const finalUrl = `${this.url}/new-one/${clientId}`;

    return this.http
      .post<IMessage>(finalUrl, dataAddress, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // PUBLIC - ENDPOINT
  // getAllByClientUID(clientUid: number): Observable<IAuthAddress[]> {
  //   const finalUrl = `${this.url}/${clientUid}`;

  //   return this.http.get<IAuthAddress[]>(finalUrl).pipe(
  //     map((resp) => resp),
  //     catchError((err) => of(err.error))
  //   );
  // }

  removeOne(addressId: number): Observable<IMessage | any> {
    const finalUrl = `${this.url}/${addressId}`;

    return this.http
      .delete<IMessage>(finalUrl, {
        body: { removedAt: formatDateToString(new Date()) },
        headers: this.getToken,
      })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
