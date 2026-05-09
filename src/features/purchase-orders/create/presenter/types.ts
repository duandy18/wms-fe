// src/features/purchase-orders/create/presenter/types.ts

import type { SupplierBasic } from "../../../../domains/partners/export/contracts/supplierBasic";
import type { ItemBasic } from "../../../../domains/pms/public/contracts/itemBasic";
import type { LineDraft } from "./lineDraft";

export interface PurchaseOrderCreateState {
  supplierId: number | null;
  supplierName: string;
  supplierOptions: SupplierBasic[];
  suppliersLoading: boolean;
  suppliersError: string | null;

  itemOptions: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;

  warehouseId: string;

  purchaser: string;
  purchaseTime: string;

  remark: string;

  lines: LineDraft[];

  submitting: boolean;
  error: string | null;
}

export interface PurchaseOrderCreateActions {
  selectSupplier: (id: number | null) => void;
  selectItemForLine: (lineId: number, itemId: number | null) => void;

  setWarehouseId: (v: string) => void;
  setPurchaser: (v: string) => void;
  setPurchaseTime: (v: string) => void;
  setRemark: (v: string) => void;
  setError: (v: string | null) => void;

  changeLineField: (lineId: number, field: keyof LineDraft, value: string) => void;
  addLine: () => void;
  removeLine: (lineId: number) => void;

  submit: (onSuccess?: (poId: number) => void) => Promise<void>;
}
