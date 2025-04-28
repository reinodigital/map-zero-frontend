import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  Route,
  UrlSegment,
} from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../api';
import { SecurityRoles } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class SellerGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.authService.revalidateToken().pipe(
      tap((valid) => {
        if (valid) {
          // Check Admin role
          const user = this.authService._user;
          if (
            !user()?.roles.includes(SecurityRoles.ADMIN) &&
            !user()?.roles.includes(SecurityRoles.SELLER) &&
            !user()?.roles.includes(SecurityRoles.SUPER_ADMIN)
          ) {
            this.router.navigateByUrl('/login');
          }
        }
      })
    );
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.revalidateToken().pipe(
      tap((valid) => {
        if (valid) {
          // Check Admin role
          const user = this.authService._user;
          if (
            !user()?.roles.includes(SecurityRoles.ADMIN) &&
            !user()?.roles.includes(SecurityRoles.SELLER) &&
            !user()?.roles.includes(SecurityRoles.SUPER_ADMIN)
          ) {
            this.router.navigateByUrl('/login');
          }
        }
      })
    );
  }
}
