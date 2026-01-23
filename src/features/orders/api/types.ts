// src/features/orders/api/types.ts

// --- 复用 DevConsole 的类型（后端 /dev/orders 已包含 Phase 5 字段） ---
import type { DevOrderSummary, DevOrderView, DevOrderFacts } from "../../dev/orders/api/index";

// ================================
// 订单列表 & 详情（复用 DevConsole）
// ================================

export type OrderSummary = DevOrderSummary & {
  // Phase 5.2（后端已补齐）：只读事实
  fulfillment_status?: string | null;
  service_warehouse_id?: number | null;
  warehouse_assign_mode?: string | null;
};

export type OrderView = DevOrderView & {
  order: DevOrderView["order"] & {
    fulfillment_status?: string | null;
    service_warehouse_id?: number | null;
    warehouse_assign_mode?: string | null;
  };
};

export type OrderFacts = DevOrderFacts;

// ================================
// Phase 5.2：仓库下拉 / 人工指定执行仓
// ================================

export type WarehouseOption = {
  id: number;
  code: string | null;
  name: string | null;
  active: boolean | null;
};
