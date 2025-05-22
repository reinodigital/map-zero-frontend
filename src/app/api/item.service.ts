import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IMessage,
  IDataToCreateItem,
  IItem,
  IDataToUpdateItem,
  IItemAndCount,
  IItemForSelectOnSale,
  IItemSuggestion,
} from '../interfaces/index';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
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

  create(data: IDataToCreateItem): Observable<IMessage | any> {
    const url = `${this._baseUrl}/item`;

    return this.http.post<IMessage>(url, data, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  fetchOne(itemId: number): Observable<IItem> {
    const url = `${this._baseUrl}/item/${itemId}`;

    return this.http.get<IItem>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  update(itemId: number, data: IDataToUpdateItem): Observable<IMessage | any> {
    const url = `${this._baseUrl}/item/${itemId}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  fetchAll(
    limit: number,
    offset: number,
    filters: any
  ): Observable<IItemAndCount> {
    const url = `${this._baseUrl}/item`;

    let params = new HttpParams().set('limit', limit).set('offset', offset);

    Object.keys(filters).forEach((key) => {
      // Append filters to query params
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http
      .get<IItemAndCount>(url, { headers: this.getToken, params })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  fetchAllForSelect(): Observable<IItemForSelectOnSale[]> {
    const url = `${this._baseUrl}/item/all-select`;

    return this.http
      .get<IItemForSelectOnSale[]>(url, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  getSuggestions(terminus: string): Observable<IItemSuggestion[]> {
    const url = `${this._baseUrl}/item/suggestions?terminus=${terminus}`;

    return this.http
      .get<IItemSuggestion[]>(url, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
