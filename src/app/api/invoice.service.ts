import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IMessage,
  IInvoice,
  IDataToCreateInvoice,
  IInvoiceAndCount,
  IDataToUpdateInvoice,
  IMarkAndChangeStatusInvoice,
  IDataEmailForSendInvoice,
} from '../interfaces';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
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

  create(data: IDataToCreateInvoice): Observable<IInvoice | any> {
    const url = `${this._baseUrl}/invoice`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  sendEmail(
    invoiceId: number,
    data: IDataEmailForSendInvoice
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice/send-email/${invoiceId}`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchOne(invoiceId: number): Observable<IInvoice> {
    const url = `${this._baseUrl}/invoice/${invoiceId}`;

    return this.http.get<IInvoice>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  downloadPDF(invoiceId: number): Observable<any> {
    const url = `${this._baseUrl}/invoice/download-pdf/${invoiceId}`;

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

  update(
    invoiceId: number,
    data: IDataToUpdateInvoice
  ): Observable<IInvoice | any> {
    const url = `${this._baseUrl}/invoice/${invoiceId}`;

    return this.http
      .patch<IInvoice>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  fetchAll(
    limit: number,
    offset: number,
    filters: any
  ): Observable<IInvoiceAndCount> {
    const url = `${this._baseUrl}/invoice`;

    let params = new HttpParams().set('limit', limit).set('offset', offset);

    Object.keys(filters).forEach((key) => {
      // Append filters to query params
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http
      .get<IInvoiceAndCount>(url, { headers: this.getToken, params })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  removeOne(invoiceId: number, removedAt: string): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice/${invoiceId}?removedAt=${removedAt}`;

    return this.http.delete<IMessage>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  /* ========= MARK && CHANGE STATUS ========== */
  markAsSent(
    invoiceId: number,
    data: IMarkAndChangeStatusInvoice
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice-actions/mark-as-sent/${invoiceId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsAwaitingApproval(
    invoiceId: number,
    data: IMarkAndChangeStatusInvoice
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice-actions/mark-as-awaiting-approval/${invoiceId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsAwaitingPayment(
    invoiceId: number,
    data: IMarkAndChangeStatusInvoice
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice-actions/mark-as-awaiting-payment/${invoiceId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsPaid(
    invoiceId: number,
    data: IMarkAndChangeStatusInvoice
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/invoice-actions/mark-as-paid/${invoiceId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
  /* ========= END MARK && CHANGE STATUS ========== */
}
