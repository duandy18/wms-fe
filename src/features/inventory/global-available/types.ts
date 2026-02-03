// src/features/inventory/global-available/types.ts

// 单个批次在某仓的库存
export interface BatchQty {
  batch_code: string;
  qty: number;
}

// 单仓全局可售（对应 GlobalAvailableSingle）
export interface GlobalAvailableSingle {
  platform: string;
  shop_id: string;
  warehouse_id: number;
  item_id: number;
  on_hand: number;
  available: number;
  batches: BatchQty[];
}

// 多仓视图里的单个仓（对应 WarehouseAvailableModel）
export interface WarehouseAvailableModel {
  warehouse_id: number;
  on_hand: number;
  available: number;
  batches: BatchQty[];
  is_top: boolean;
  is_default: boolean;
  priority: number;
}

// 多仓全局可售（对应 GlobalAvailableMulti）
export interface GlobalAvailableMulti {
  platform: string;
  shop_id: string;
  item_id: number;
  warehouses: WarehouseAvailableModel[];
}
