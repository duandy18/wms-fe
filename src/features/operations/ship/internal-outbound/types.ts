// src/features/operations/ship/internal-outbound/types.ts

export type InternalOutboundLine = {
  id: number;
  doc_id: number;
  line_no: number;
  item_id: number;
  batch_code: string | null;
  requested_qty: number;
  confirmed_qty: number | null;
  uom: string | null;
  note: string | null;
  extra_meta: Record<string, unknown> | null;
};

export type InternalOutboundDoc = {
  id: number;
  warehouse_id: number;
  doc_no: string;
  doc_type: string;
  status: string;
  recipient_name: string | null;
  recipient_type: string | null;
  recipient_note: string | null;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  trace_id: string | null;
  lines: InternalOutboundLine[];
};

export const DOC_TYPES: Array<{ value: string; label: string }> = [
  { value: "SAMPLE_OUT", label: "样品出库" },
  { value: "INTERNAL_USE", label: "内部领用" },
  { value: "SCRAP", label: "报废/损毁" },
];

export type StockHint = {
  loading: boolean;
  qty: number | null;
  batches: number | null;
};

export type InventorySnapshotRow = {
  available_qty?: number | null;
  qty?: number | null;
  onhand_qty?: number | null;
};
