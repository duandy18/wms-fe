import type { PurchaseOrderCompletionListItem } from "../api";
import type { SupplierBasic } from "../../../domains/pms/public/contracts/supplierBasic";

export type StatusFilter = "ALL" | "NOT_RECEIVED" | "PARTIAL" | "RECEIVED";

export type SupplierOption = SupplierBasic;

export interface PurchaseOrdersPageState {
  rows: PurchaseOrderCompletionListItem[];
  loadingList: boolean;
  listError: string | null;

  supplierFilter: string;
  statusFilter: StatusFilter;
  searchText: string;

  supplierOptions: SupplierOption[];
  suppliersLoading: boolean;
  suppliersError: string | null;
}

export interface PurchaseOrdersPageActions {
  setSupplierFilter: (v: string) => void;
  setStatusFilter: (v: StatusFilter) => void;
  setSearchText: (v: string) => void;
  reload: () => void;
}

export type PurchaseOrdersPageController = PurchaseOrdersPageState &
  PurchaseOrdersPageActions;
