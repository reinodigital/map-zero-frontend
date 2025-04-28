import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ListClientsService {
  public lastOffsetListClients = signal<number>(0);
}
