import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { LS } from '../enums';
import { IDataToCreateNewClientContact, IMessage } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ClientContactService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = environment.baseUrl;
  private url = `${this._baseUrl}/client-contact`;

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
    data: IDataToCreateNewClientContact
  ): Observable<IMessage | any> {
    const finalUrl = `${this.url}/new-one/${clientId}`;

    return this.http
      .post<IMessage>(finalUrl, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  removeOne(contactId: number): Observable<IMessage | any> {
    const finalUrl = `${this.url}/${contactId}`;

    return this.http.delete<IMessage>(finalUrl).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }
}
