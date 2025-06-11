import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ClientService } from '../../../../api';
import { CommonAdminService } from '../../../../shared/services/common-admin.service';
import { DetailClientService } from '../detail-client.service';
import { ListClientsService } from '../list-clients.service';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';

import { IClient, IDataEntity } from '../../../../interfaces';
import { NameEntities } from '../../../../enums';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'detail-client',
  imports: [RouterLink, TrackingEntityComponent, BreadcrumbComponent],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.scss',
})
export default class DetailClientComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private commonAdminService = inject(CommonAdminService);
  private destroyRef = inject(DestroyRef);
  private clientService = inject(ClientService);

  public entityData = signal<IDataEntity | null>(null);
  public listClientsService = inject(ListClientsService);
  public detailClientService = inject(DetailClientService);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public clientId!: number;
  public client = signal<IClient | null>(null);

  constructor() {
    this.clientId = this.activatedRoute.snapshot.params['id'];
    this.entityData.set({
      refEntity: NameEntities.CLIENT,
      refEntityId: this.clientId,
    });
  }

  ngOnInit(): void {
    this.fetchClientById();

    // LISTEN WHEN NEW ADDRESS WAS ADDED
    this.detailClientService.newAddress$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.fetchClientById();
      });
  }

  private fetchClientById(): void {
    this.clientService
      .fetchOne(this.clientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resp) => {
        if (resp && resp.id) {
          this.client.set(resp);
        }
      });
  }

  addNewAddress(): void {
    this.detailClientService.addNewAddress(this.clientId);
  }

  removeAddress(addressId: number): void {
    this.detailClientService.removeAddress(addressId);
  }

  addNewContact(): void {
    this.detailClientService.addNewContact(this.clientId);
  }

  removeContact(contactId: number): void {
    this.detailClientService.removeContact(contactId);
  }

  comeBackToList(): void {
    this.commonAdminService.comeBackToList('/list-clients');
  }
}
