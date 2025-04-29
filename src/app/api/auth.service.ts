import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  IAuth,
  IAuthToLogin,
  IAuthToSignUp,
  IAuthAndCount,
  IAuthToUpdate,
  IMessage,
  ShortAuth,
} from '../interfaces/index';
import { isPlatformBrowser } from '@angular/common';
import { LS, SecurityRoles } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private _baseUrl = environment.baseUrl;
  public _user = signal<IAuth | null>(null);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get userProps() {
    return this._user();
  }

  get getToken() {
    if (this.isBrowser) {
      const token = localStorage.getItem(LS.LS_TOKEN_SYSTEM) || '';
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }

    return new HttpHeaders().set('Authorization', `Bearer `);
  }

  get isAccountant() {
    if (!this._user()) return false;

    return this._user()!.roles.includes(SecurityRoles.ACCOUNTANT);
  }

  get isAdmin() {
    if (!this._user()) return false;

    return (
      this._user()!.roles.includes(SecurityRoles.ADMIN) ||
      this._user()!.roles.includes(SecurityRoles.SUPER_ADMIN)
    );
  }

  get isSuperAdmin() {
    if (!this._user()) return false;

    return this._user()!.roles.includes(SecurityRoles.SUPER_ADMIN);
  }

  // SIGN IN
  login(dataToLogin: IAuthToLogin): Observable<IAuth | any> {
    const url = `${this._baseUrl}/auth/sign-in`;

    return this.http.post<IAuth>(url, dataToLogin).pipe(
      tap((resp) => {
        if (resp.uid && this.isBrowser) {
          localStorage.setItem(LS.LS_TOKEN_SYSTEM, resp.token!);
        }
      }),
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  // SIGN UP
  register(dataToRegister: IAuthToSignUp): Observable<IMessage | any> {
    const url = `${this._baseUrl}/auth/sign-up`;

    return this.http
      .post<IMessage>(url, dataToRegister, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // RENEW
  revalidateToken(): Observable<boolean> {
    const url = `${this._baseUrl}/auth/renew`;

    return this.http.get<IAuth>(url, { headers: this.getToken }).pipe(
      map((resp) => {
        if (resp.uid && this.isBrowser) {
          localStorage.setItem(LS.LS_TOKEN_SYSTEM, resp.token!);

          const { name, uid, ...restUser } = resp!;
          this._user.set({
            uid,
            name,
            ...restUser,
          });
        }

        return true;
      }),
      catchError((err) => of(false))
    );
  }

  // FETCH ONE
  fetchOne(uid: number): Observable<IAuth> {
    const url = `${this._baseUrl}/auth/${uid}`;

    return this.http.get<IAuth>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  // UPDATE
  update(uid: number, data: IAuthToUpdate): Observable<IMessage | any> {
    const url = `${this._baseUrl}/auth/${uid}`;

    return this.http
      .patch<IMessage>(url, data, { headers: this.getToken })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  // LOGOUT
  logout(): Observable<any> {
    const url = `${this._baseUrl}/auth/logout`;

    return this.http.get<any>(url, { headers: this.getToken }).pipe(
      tap((resp) => {
        if (resp.ok) {
          localStorage.removeItem(LS.LS_TOKEN_SYSTEM);
          this._user.set(null);
        }
      }),
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }

  // FETCH ALL
  fetchAllByAdmin(
    limit: number,
    offset: number,
    filters: any
  ): Observable<IAuthAndCount> {
    const url = `${this._baseUrl}/auth`;

    let params = new HttpParams().set('limit', limit).set('offset', offset);

    Object.keys(filters).forEach((key) => {
      // Append filters to query params
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    return this.http
      .get<IAuthAndCount>(url, { headers: this.getToken, params })
      .pipe(
        map((resp) => resp),
        catchError((err) => of(err.error))
      );
  }

  fetchAllSellers(): Observable<ShortAuth[]> {
    const url = `${this._baseUrl}/auth/all-sellers`;

    return this.http.get<ShortAuth[]>(url, { headers: this.getToken }).pipe(
      map((resp) => resp),
      catchError((err) => of(err.error))
    );
  }
}
