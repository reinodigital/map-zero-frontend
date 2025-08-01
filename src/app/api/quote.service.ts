import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IMessage,
  IQuote,
  IQuoteAndCount,
  IDataToCreateQuote,
  IDataEmailForSendQuote,
  IMarkAndChangeStatus,
  IDataToUpdateQuote,
  IInvoice,
  ICreateInvoiceFromAcceptedQuote,
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

  create(data: IDataToCreateQuote): Observable<IQuote | any> {
    const url = `${this._baseUrl}/quote`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  downloadPDF(quoteId: number): Observable<any> {
    const url = `${this._baseUrl}/quote/generate-pdf/${quoteId}`;

    return this.http
      .get(url, {
        headers: this.getToken,
        responseType: 'arraybuffer', // Correctly specify arraybuffer for binary data
      })
      .pipe(
        map((arrayBuffer: ArrayBuffer) => {
          // Convert the ArrayBuffer into a Blob
          return new Blob([arrayBuffer], { type: 'application/pdf' });
        }),
        catchError((err) => of(err.error))
      );
  }

  copyToDraft(quoteId: number, createdAt: string): Observable<IQuote | any> {
    const url = `${this._baseUrl}/quote/copy-to-draft/${quoteId}`;

    return this.http
      .post<IQuote>(url, { createdAt }, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  copyToInvoice(
    quoteId: number,
    data: ICreateInvoiceFromAcceptedQuote
  ): Observable<IInvoice | any> {
    const url = `${this._baseUrl}/quote/copy-to-invoice/${quoteId}`;

    return this.http.post<IInvoice>(url, data, { headers: this.getToken }).pipe(
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

  update(quoteId: number, data: IDataToUpdateQuote): Observable<IQuote | any> {
    const url = `${this._baseUrl}/quote/${quoteId}`;

    return this.http.patch<IQuote>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

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

  removeOne(quoteId: number, removedAt: string): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/${quoteId}?removedAt=${removedAt}`;

    return this.http.delete<IMessage>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  /* ========= MARK && CHANGE STATUS ========== */
  markAsSent(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/mark-as-sent/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsAccepted(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/mark-as-accepted/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsDeclined(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/mark-as-declined/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsInvoiced(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/mark-as-invoiced/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
  /* ========= END MARK && CHANGE STATUS ========== */

  /* ========= UNDO MARK && COME BACK STATUS ========== */
  undoMarkAsAccepted(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/undo-mark-as-accepted/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  undoMarkAsDeclined(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/undo-mark-as-declined/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  undoMarkAsInvoiced(
    quoteId: number,
    data: IMarkAndChangeStatus
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/quote/undo-mark-as-invoiced/${quoteId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
  /* ========= END UNDO MARK && COME BACK STATUS ========== */
}
