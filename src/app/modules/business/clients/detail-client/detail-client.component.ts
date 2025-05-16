import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ClientService } from '../../../../api';
import { DetailClientService } from '../detail-client.service';
import { ListClientsService } from '../list-clients.service';
import { TrackingEntityComponent } from '../../../../shared/components/tracking-entity/tracking-entity.component';

import { IClient } from '../../../../interfaces';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'detail-client',
  imports: [RouterLink, TrackingEntityComponent],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.scss',
})
export default class DetailClientComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  public listClientsService = inject(ListClientsService);
  public detailClientService = inject(DetailClientService);

  private location = inject(Location);
  private clientService = inject(ClientService);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // DATA
  public clientId!: number;
  public client = signal<IClient | null>(null);

  constructor() {
    this.clientId = this.activatedRoute.snapshot.params['id'];
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

  // Redirect to list, but if filters applies then keep them
  comeBackToList(): void {
    if (this.isBrowser) {
      this.checkBackUrl()
        ? window.history.go(-1)
        : this.router.navigateByUrl('/list-clients');
    }
  }

  private checkBackUrl(): boolean {
    const backUrl: any = this.location.getState();

    return backUrl && backUrl.navigationId > 1;
  }
}
