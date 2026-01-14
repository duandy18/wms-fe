// src/features/inventory/ledger/types_ui.ts
export type LedgerHint = {
  item_id: number | null;
  item_keyword: string | null;
  warehouse_id: number | null;
  batch_code: string | null;
  reason: string | null;
  ref: string | null;
  trace_id: string | null;
  time_from: string | null;
  time_to: string | null;
};
