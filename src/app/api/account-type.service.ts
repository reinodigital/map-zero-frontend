import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { IMessage, ICommonSelect, IAccountType } from '../interfaces/index';
import { isPlatformBrowser } from '@angular/common';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class AccountTypeService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = `${environment.baseUrl}/account-type`;

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

  create(data: any): Observable<IMessage | any> {
    const url = `${this._baseUrl}`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchAll(): Observable<IAccountType[]> {
    const url = `${this._baseUrl}`;

    return this.http.get<IAccountType[]>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  update(accountTypeId: number, data: any): Observable<IMessage | any> {
    const url = `${this._baseUrl}/${accountTypeId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
