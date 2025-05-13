import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IMessage,
  IQuote,
  IQuoteAndCount,
  IDataToSubmitAndSaveNewQuote,
  IDataEmailForSendQuote,
} from '../interfaces/index';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = environment.baseUrl;

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

  create(data: IDataToSubmitAndSaveNewQuote): Observable<IQuote | any> {
    const url = `${this._baseUrl}/quote`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  sendEmail(
    quoteId: number,
    data: IDataEmailForSendQuote
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/send-email/${quoteId}`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchOne(quoteId: number): Observable<IQuote> {
    const url = `${this._baseUrl}/quote/${quoteId}`;

    return this.http.get<IQuote>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  // update(quoteId: number, data: IData): Observable<IMessage | any> {
  //   const url = `${this._baseUrl}/quote/${quoteId}`;

  //   return this.http
  //     .patch<IMessage>(url, data, { headers: this.getToken })
  //     .pipe(
  //       map((resp) => resp),
  //       catchError((err) => of(err.error))
  //     );
  // }

  fetchAll(
    limit: number,
    offset: number,
    filters: any
  ): Observable<IQuoteAndCount> {
    const url = `${this._baseUrl}/quote`;

    let params = new HttpParams().set('limit', limit).set('offset', offset);

    Object.keys(filters).forEach((key) => {
      // Append filters to query params
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http
      .get<IQuoteAndCount>(url, { headers: this.getToken, params })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
