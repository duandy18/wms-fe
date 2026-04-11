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
  lot_code?: string | null;

  qty: number;
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
  totals: {
    on_hand_qty: number;
    available_qty: number;
  };
  slices: InventoryDetailSlice[];
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
