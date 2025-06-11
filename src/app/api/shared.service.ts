import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../environments/environment';

import { IAddTrackingNote, ITracking } from '../interfaces';
import { LS } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = `${environment.baseUrl}/shared`;

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

  addTrackingNote(data: IAddTrackingNote): Observable<ITracking | any> {
    const url = `${this._baseUrl}/add-tracking-note`;

    return this.http
      .post<ITracking>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
