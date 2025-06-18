import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { LS } from '../enums';
import {} from '../interfaces/index';
import { IActivitiesSuggestionResponse } from '../interfaces/index';

@Injectable({
  providedIn: 'root',
})
export class EconomicActivityService {
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

  getActivitiesSuggestions(
    term: string,
    limit: number,
    offset: number
  ): Observable<IActivitiesSuggestionResponse> {
    const url = `${this._baseUrl}/activity/search-activities/${term}`;
    let params = new HttpParams().set('limit', limit).set('offset', offset);

    return this.http.get<IActivitiesSuggestionResponse>(url, { params }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }
}
