// src/features/inventory/channel-inventory/types.ts

// 单个批次在某仓的库存
export interface BatchQty {
  batch_code: string;
  qty: number;
}

// 单仓渠道可售（对应 ChannelInventoryModel）
export interface ChannelInventorySingle {
  platform: string;
  shop_id: string;
  warehouse_id: number;
  item_id: number;
  on_hand: number;
  reserved_open: number;
  available: number;
  batches: BatchQty[];
}

// 多仓视图里的单个仓（对应 WarehouseInventoryModel）
export interface WarehouseInventoryModel {
  warehouse_id: number;
  on_hand: number;
  reserved_open: number;
  available: number;
  batches: BatchQty[];
  is_top: boolean;
  is_default: boolean;
  priority: number;
}

// 多仓渠道可售（对应 ChannelInventoryMultiModel）
export interface ChannelInventoryMultiModel {
  platform: string;
  shop_id: string;
  item_id: number;
  warehouses: WarehouseInventoryModel[];
}
