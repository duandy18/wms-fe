// src/types/inventory.ts

// 单个库位上的库存
export type InventoryLocation = {
  warehouse_id: number;
  batch_code: string;
  qty: number;
};

// /snapshot/inventory 返回的每一行（卡片 / 表格用）
export type InventoryTile = {
  item_id: number;
  item_name: string;
  total_qty: number;
  top2_locations: InventoryLocation[];
  earliest_expiry: string | null;
  near_expiry: boolean;
};

// /snapshot/inventory 的分页结果
export type InventoryPage = {
  total: number;
  offset: number;
  limit: number;
  rows: InventoryTile[];
};

// /snapshot/location-heat 返回的结构（Drawer 用）
export type InventoryDistribution = {
  item_id: number;
  item_name: string;
  locations: InventoryLocation[];
};

// 单个仓+批次切片的明细（Drawer V2 用）
export type InventoryItemSlice = {
  warehouse_id: number;
  warehouse_name: string;
  pool: "MAIN" | "RETURNS" | "QUARANTINE";
  batch_code: string;
  mfg_date: string | null;
  expire_at: string | null;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
  near_expiry: boolean;
  is_top?: boolean;
};

// /snapshot/item-detail/{item_id} 返回的整体结构
export type InventoryItemDetail = {
  item_id: number;
  item_name: string;
  sku?: string;
  barcode?: string;
  spec?: string;
  totals: {
    on_hand_qty: number;
    reserved_qty: number;
    available_qty: number;
  };
  slices: InventoryItemSlice[];
};
