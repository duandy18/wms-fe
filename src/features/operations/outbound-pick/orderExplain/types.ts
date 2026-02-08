// src/features/operations/outbound-pick/orderExplain/types.ts

export type PlatformOrderReplayIn = {
  platform: string; // 后端当前是大写也行：前端不推导不改写
  store_id: number;
  ext_order_no: string;
};

export type UnresolvedReason =
  | "FACTS_NOT_FOUND"
  | "MISSING_PSKU"
  | "MISSING_BINDING"
  | "FSKU_NO_COMPONENTS_OR_NOT_PUBLISHED"
  | "COMPONENT_QTY_INVALID"
  | string;

export type OrderResolveUnresolved = {
  reason: UnresolvedReason;
  hint?: string | null;

  // resolver / facts 分支可能带这些字段
  platform_sku_id?: string | null;
  qty?: number | null;
  fsku_id?: number | null;
};

export type OrderResolveResolved = {
  platform_sku_id: string;
  qty: number;
  fsku_id: number;
  expanded_items: Array<{
    item_id: number;
    component_qty: number;
    need_qty: number;
    role?: string | null;
  }>;
};

export type PlatformOrderReplayOut = {
  status: string;
  id?: number | null;
  ref: string;

  platform: string;
  store_id: number;
  ext_order_no: string;

  facts_n: number;
  resolved: Array<Record<string, unknown>>; // 后端目前返回 r.__dict__，不强行假设结构
  unresolved: OrderResolveUnresolved[];

  fulfillment_status?: string | null;
  blocked_reasons?: string[] | null;
};

export type OrderExplainCardInput = {
  orderId?: number; // 可选：如果页面选中订单有内部 order_id，可保留用于其它跳转
  platform: string;
  store_id?: number | null;
  ext_order_no: string;
  shop_id?: string; // 外部店铺标识（展示用）
};
