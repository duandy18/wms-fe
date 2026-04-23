export type InventoryPageQuery = {
  q?: string;
  item_id?: number;
  warehouse_id?: number;
  lot_code?: string;
  near_expiry?: boolean;
  offset?: number;
  limit?: number;
};

export interface InventoryRow {
  item_id: number;
  item_name: string;

  item_code?: string | null;
  spec?: string | null;
  main_barcode?: string | null;
  brand?: string | null;
  category?: string | null;

  warehouse_id: number;
  warehouse_name?: string | null;
  lot_code?: string | null;

  qty: number;
  base_item_uom_id?: number | null;
  base_uom_name?: string | null;

  expiry_date: string | null;
  near_expiry: boolean;
  days_to_expiry?: number | null;
}

export interface InventoryResponse {
  total: number;
  offset: number;
  limit: number;
  rows: InventoryRow[];
}

export interface InventoryDetailQuery {
  warehouse_id?: number;
  lot_code?: string;
  pools?: string[];
}

export interface InventoryDetailSlice {
  warehouse_id: number;
  warehouse_name: string;
  pool: string;

  lot_code?: string | null;
  production_date: string | null;
  expiry_date: string | null;

  on_hand_qty: number;
  available_qty: number;

  near_expiry: boolean;
  is_top: boolean;
}

export interface InventoryDetailResponse {
  item_id: number;
  item_name: string;
  base_item_uom_id?: number | null;
  base_uom_name?: string | null;
  totals: {
    on_hand_qty: number;
    available_qty: number;
  };
  slices: InventoryDetailSlice[];
}

export interface InventoryExplainIn {
  item_id: number;
  warehouse_id: number;
  lot_id?: number | null;
  lot_code?: string | null;
  limit?: number;
}

export interface InventoryExplainAnchor {
  item_id: number;
  item_name: string;
  warehouse_id: number;
  warehouse_name: string;
  lot_id: number;
  lot_code?: string | null;
  base_item_uom_id?: number | null;
  base_uom_name?: string | null;
  current_qty: number;
}

export interface InventoryExplainLedgerRow {
  id: number;
  occurred_at: string;
  created_at: string;
  reason: string;
  reason_canon?: string | null;
  sub_reason?: string | null;
  ref: string;
  ref_line: number;
  delta: number;
  after_qty: number;
  trace_id?: string | null;
  movement_type?: string | null;
  item_id: number;
  item_name?: string | null;
  warehouse_id: number;
  lot_id?: number | null;
  lot_code?: string | null;
  base_item_uom_id?: number | null;
  base_uom_name?: string | null;
}

export interface InventoryExplainSummary {
  row_count: number;
  truncated: boolean;
  current_qty: number;
  ledger_last_after_qty?: number | null;
  matches_current?: boolean | null;
}

export interface InventoryExplainResponse {
  anchor: InventoryExplainAnchor;
  ledger_rows: InventoryExplainLedgerRow[];
  summary: InventoryExplainSummary;
}

export interface InventoryWarehouseOption {
  id: number;
  name: string;
  code?: string | null;
  active: boolean;
}

export interface InventoryItemOption {
  id: number;
  sku: string;
  name: string;
}

export interface InventoryOptionsResponse {
  warehouses: InventoryWarehouseOption[];
  items: InventoryItemOption[];
}
