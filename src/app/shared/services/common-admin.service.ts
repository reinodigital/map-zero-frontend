import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, Location } from '@angular/common';
import { Router } from '@angular/router';

import { CustomToastService } from './custom-toast.service';
import { TypeMessageToast } from '../../enums';

@Injectable({
  providedIn: 'root',
})
export class CommonAdminService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private location = inject(Location);
  private customToastService = inject(CustomToastService);

  processResponseWithMessage(resp: any, route: string | null = null): void {
    if (resp && resp.msg) {
      this.customToastService.add({
        message: resp.msg,
        type: TypeMessageToast.SUCCESS,
        duration: 5000,
      });

      if (route) {
        this.router.navigateByUrl(route);
      }
    } else {
      this.customToastService.add({
        message: resp.message,
        type: TypeMessageToast.ERROR,
        duration: 5000,
      });
    }
  }

  comeBackToList(route: string): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl(route);
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
