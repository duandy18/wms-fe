// src/features/tms/reconciliation/types.ts

export interface ReconcileCarrierBillIn {
  import_batch_id: number;
}

export interface ReconcileCarrierBillResult {
  ok: boolean;
  import_batch_id: number;
  carrier_code: string;
  import_batch_no: string;
  bill_item_count: number;
  diff_count: number;
  bill_only_count: number;
  record_only_count: number;
  updated_count: number;
  duplicate_bill_tracking_count: number;
}
