// src/features/admin/stores/platform-skus/types.ts

export type PlatformSkuBindingStatus = "bound" | "unbound";
export type PlatformSkuBindingTargetType = "item" | "fsku" | null;

export interface PlatformSkuBindingSummary {
  status: PlatformSkuBindingStatus;
  target_type: PlatformSkuBindingTargetType;
  item_id: number | null;
  fsku_id: number | null;
  effective_from: string | null;
}

export interface PlatformSkuListItem {
  platform: string;
  shop_id: number;
  platform_sku_id: string;
  sku_name: string | null;
  binding: PlatformSkuBindingSummary;
}

export interface PlatformSkuListOut {
  items: PlatformSkuListItem[];
  total: number;
  limit: number;
  offset: number;
}

