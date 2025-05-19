import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { IMessage, ICommonSelect } from '../interfaces/index';
import { isPlatformBrowser } from '@angular/common';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
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

  fetchAllShortAccountsType(): Observable<ICommonSelect[]> {
    const url = `${this._baseUrl}/all-short`;

    return this.http.get<ICommonSelect[]>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  // UPDATE
  // update(clientId: number, data: IClientToUpdate): Observable<IMessage | any> {
  //   const url = `${this._baseUrl}/client/${clientId}`;

  //   return this.http
  //     .patch<IMessage>(url, data, { headers: this.getToken })
  //     .pipe(
  //       map((resp) => resp),
  //       catchError((err) => of(err.error))
  //     );
  // }

  // fetchAll(
  //   limit: number,
  //   offset: number,
  //   filters: any
  // ): Observable<IClientAndCount> {
  //   const url = `${this._baseUrl}/client`;

  //   let params = new HttpParams().set('limit', limit).set('offset', offset);

  //   Object.keys(filters).forEach((key) => {
  //     // Append filters to query params
  //     if (filters[key]) {
  //       params = params.set(key, filters[key]);
  //     }
  //   });

  //   return this.http
  //     .get<IClientAndCount>(url, { headers: this.getToken, params })
  //     .pipe(
  //       map((resp) => resp),
  //       catchError((err) => of(err.error))
  //     );
  // }
}
