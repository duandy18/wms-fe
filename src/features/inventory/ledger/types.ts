// src/features/inventory/ledger/types.ts

export type LedgerRow = {
  id: number;

  delta: number;

  // 原始 reason（可能包含别名）
  reason: string;

  // 稳定口径：RECEIPT / SHIPMENT / ADJUSTMENT
  reason_canon: string | null;

  // 业务细分：PO_RECEIPT / COUNT_ADJUST / ORDER_SHIP ...
  sub_reason: string | null;

  ref: string | null;
  ref_line: number | null;

  occurred_at: string;
  created_at: string;

  after_qty: number;

  item_id: number;
  // ✅ 可选：后端若回传则展示；不回传就显示 "-"
  item_name?: string | null;

  warehouse_id: number;
  batch_code: string | null;

  trace_id: string | null;

  movement_type: string | null; // INBOUND / OUTBOUND / COUNT / ADJUST / ...
};

export type LedgerListResp = {
  total: number;
  items?: LedgerRow[];
};
