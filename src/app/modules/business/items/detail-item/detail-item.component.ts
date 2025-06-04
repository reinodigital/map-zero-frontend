import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ListItemsService } from '../list-items.service';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { ItemService } from '../../../../api';
import { IItem } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'detail-item',
  standalone: true,
  imports: [RouterLink, TrackingEntityComponent, BreadcrumbComponent],
  templateUrl: './detail-item.component.html',
  styleUrl: './detail-item.component.scss',
})
export default class DetailItemComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);

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
    this.commonAdminService.comeBackToList('/list-items');
  }
}
