// src/features/diagnostics/ledger-tool/types.ts

export type LedgerRow = {
  id: number;
  delta: number;
  reason: string;
  ref?: string | null;
  ref_line: number;
  occurred_at: string;
  created_at: string;
  after_qty: number;
  item_id: number;
  warehouse_id: number;
  batch_code: string;
  trace_id?: string | null;
  movement_type?: string | null;
};

export type LedgerList = {
  total: number;
  items: LedgerRow[];
};

export type LedgerReasonStat = {
  reason: string;
  count: number;
  total_delta: number;
};

export type LedgerSummary = {
  filters: LedgerQueryPayload;
  by_reason: LedgerReasonStat[];
  net_delta: number;
};

export type LedgerReconcileRow = {
  warehouse_id: number;
  item_id: number;
  batch_code: string;
  ledger_sum_delta: number;
  stock_qty: number;
  diff: number;
};

export type LedgerReconcileResult = {
  rows: LedgerReconcileRow[];
};

export type LedgerQueryPayload = {
  item_id?: number;
  item_keyword?: string;
  warehouse_id?: number;
  batch_code?: string;
  reason?: string;
  ref?: string;
  trace_id?: string;
  time_from?: string; // ISO
  time_to?: string; // ISO
  limit: number;
  offset: number;
};
