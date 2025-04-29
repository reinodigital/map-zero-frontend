import { isPlatformBrowser, Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../../api';
import { IClient } from '../../../interfaces';
import { ListClientsService } from '../list-clients.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'detail-client',
  imports: [RouterLink],
  templateUrl: './detail-client.component.html',
  styleUrl: './detail-client.component.scss',
})
export default class DetailClientComponent {
  private platformId = inject(PLATFORM_ID);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  public listClientsService = inject(ListClientsService);

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
  }

  private fetchClientById(): void {
    this.clientService.fetchOne(this.clientId).subscribe((resp) => {
      if (resp && resp.id) {
        this.client.set(resp);
      }
    });
  }

  // --------- HELPERS ----------

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
