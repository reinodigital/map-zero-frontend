import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ListItemsService } from '../list-items.service';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';

import { ItemService } from '../../../../api';
import { IItem } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-item',
  standalone: true,
  imports: [RouterLink, TrackingEntityComponent],
  templateUrl: './detail-item.component.html',
  styleUrl: './detail-item.component.scss',
})
export default class DetailItemComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private location = inject(Location);

  private itemService = inject(ItemService);
  public listItemsService = inject(ListItemsService);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public itemId!: number;
  public item = signal<IItem | null>(null);

  constructor() {
    this.itemId = this.activatedRoute.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.fetchItem();
  }

  private fetchItem(): void {
    this.itemService
      .fetchOne(this.itemId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.item.set(resp);
        }
      });
  }

  // Redirect to list, but if filters applies then keep them
  comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-items');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
