import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../environments/environment';

import { LS } from '../enums';
import { ITerritory } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TerritoryService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private baseUrl = environment.baseUrl;
  private url = `${this.baseUrl}/territory`;

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

  // GET ALL SEVEN PROVINCES
  fetchProvinces(): Observable<ITerritory[]> {
    const finalUrl = `${this.url}/provinces`;

    return this.http
      .get<ITerritory[]>(finalUrl, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // GET CANTONS BY PROVINCE ID
  fetchCantonsByProvinceId(provinceId: number): Observable<ITerritory[]> {
    const finalUrl = `${this.url}/cantons?provinceId=${provinceId}`;

    return this.http
      .get<ITerritory[]>(finalUrl, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // GET DISTRICTS BY CANTON ID
  fetchDistrictsByCantonId(cantonId: number): Observable<ITerritory[]> {
    const finalUrl = `${this.url}/districts?cantonId=${cantonId}`;

    return this.http
      .get<ITerritory[]>(finalUrl, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }
}
