import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IMessage,
  IDataToCreatePurchaseOrder,
  IPurchaseOrder,
  IDataEmailForSendPurchaseOrder,
  IDataToUpdatePurchaseOrder,
  IPurchaseOrderAndCount,
  IMarkAndChangeStatusPurchaseOrder,
} from '../interfaces';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class PurchaseOrderService {
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

  create(data: IDataToCreatePurchaseOrder): Observable<IPurchaseOrder | any> {
    const url = `${this._baseUrl}/purchase-order`;

    return this.http
      .post<IPurchaseOrder>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  copyToDraft(
    purchaseOrderId: number,
    createdAt: string
  ): Observable<IPurchaseOrder | any> {
    const url = `${this._baseUrl}/purchase-order/copy-to-draft/${purchaseOrderId}`;

    return this.http
      .post<IPurchaseOrder>(url, { createdAt }, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // copyToInvoice(
  //   purchaseOrderId: number,
  //   data: ICreateInvoiceFromAcceptedPurchaseOrder
  // ): Observable<IInvoice | any> {
  //   const url = `${this._baseUrl}/purchase-order/copy-to-invoice/${purchaseOrderId}`;

  //   return this.http.post<IInvoice>(url, data, { headers: this.getToken }).pipe(
  //     map((resp) => resp),
  //     catchError((err) => of(err.error))
  //   );
  // }

  sendEmail(
    purchaseOrderId: number,
    data: IDataEmailForSendPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/send-email/${purchaseOrderId}`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchOne(purchaseOrderId: number): Observable<IPurchaseOrder> {
    const url = `${this._baseUrl}/purchase-order/${purchaseOrderId}`;

    return this.http.get<IPurchaseOrder>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  update(
    purchaseOrderId: number,
    data: IDataToUpdatePurchaseOrder
  ): Observable<IPurchaseOrder | any> {
    const url = `${this._baseUrl}/purchase-order/${purchaseOrderId}`;

    return this.http
      .patch<IPurchaseOrder>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  fetchAll(
    limit: number,
    offset: number,
    filters: any
  ): Observable<IPurchaseOrderAndCount> {
    const url = `${this._baseUrl}/purchase-order`;

    let params = new HttpParams().set('limit', limit).set('offset', offset);

    Object.keys(filters).forEach((key) => {
      // Append filters to query params
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http
      .get<IPurchaseOrderAndCount>(url, { headers: this.getToken, params })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  removeOne(
    purchaseOrderId: number,
    removedAt: string
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/${purchaseOrderId}?removedAt=${removedAt}`;

    return this.http.delete<IMessage>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  /* ========= MARK && CHANGE STATUS ========== */
  markAsSent(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/mark-as-sent/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsAccepted(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/mark-as-accepted/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsDeclined(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/mark-as-declined/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  markAsInvoiced(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/mark-as-invoiced/${purchaseOrderId}`;

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
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/undo-mark-as-accepted/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  undoMarkAsDeclined(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/undo-mark-as-declined/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  undoMarkAsInvoiced(
    purchaseOrderId: number,
    data: IMarkAndChangeStatusPurchaseOrder
  ): Observable<IMessage | any> {
    const url = `${this._baseUrl}/purchase-order/undo-mark-as-invoiced/${purchaseOrderId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
  /* ========= END UNDO MARK && COME BACK STATUS ========== */
}
