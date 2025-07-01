import { NameEntities } from '../enums';

type EntityStatusMap = Record<string, number>;

export interface ISalesOverviewStats {
  statusCounts: Record<
    NameEntities.QUOTE | NameEntities.INVOICE,
    EntityStatusMap
  >;
  totalsByStatus: Record<
    NameEntities.QUOTE | NameEntities.INVOICE,
    EntityStatusMap
  >;
}

export interface IPurchasesOverviewStats {
  statusCounts: Record<NameEntities.PURCHASE_ORDER, EntityStatusMap>;
  totalsByStatus: Record<NameEntities.PURCHASE_ORDER, EntityStatusMap>;
}
