// src/features/purchase-orders/createV2/presenter/types.ts

import type { PurchaseOrderWithLines } from "../../api";
import type { SupplierBasic } from "../../../../master-data/suppliersApi";
import type { ItemBasic } from "../../../../master-data/itemsApi";
import type { LineDraft } from "../lineDraft";

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
  purchaseTime: string; // datetime-local 字符串

  remark: string;

  lines: LineDraft[];

  lastCreatedPo: PurchaseOrderWithLines | null;

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
