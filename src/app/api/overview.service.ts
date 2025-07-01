import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { IMessage, ICountAndAccountAll } from '../interfaces/index';
import { isPlatformBrowser } from '@angular/common';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = `${environment.baseUrl}/overview`;

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

  fetchSalesOverview(): Observable<any | any> {
    const url = `${this._baseUrl}/sales`;

    return this.http.get<any>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchPurchasesOverview(): Observable<any | any> {
    const url = `${this._baseUrl}/purchases`;

    return this.http.get<any>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }
}
