import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { LS } from '../enums';
import { ICabysSuggestionResponse } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class CabysService {
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

  getCabysSuggestions(
    term: string,
    limit: number,
    offset: number
  ): Observable<ICabysSuggestionResponse> {
    const url = `${this._baseUrl}/cabys/search-cabys/${term}`;
    let params = new HttpParams().set('limit', limit).set('offset', offset);

    return this.http.get<ICabysSuggestionResponse>(url, { params }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }
}
