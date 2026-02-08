// src/features/admin/psku/types.ts

export type PskuId = number;

export type MirrorFreshness = "ok" | "stale" | "missing";

export interface PskuMirror {
  title?: string | null;
  variant_name?: string | null;
  image_url?: string | null;

  platform_sku_id: string;
  platform_product_id?: string | null;

  observed_at?: string | null; // ISO string
}

export type FskuStatus = "draft" | "published" | "archived" | "retired";

export interface FskuRef {
  id: number;
  code: string;
  name: string;
  status: FskuStatus;
}

/**
 * 后端迁移接口：POST /platform-sku-bindings/{binding_id}/migrate
 * 所以必须拿到 binding_id
 */
export interface PskuBinding {
  binding_id: number;
  fsku: FskuRef;

  effective_from?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface PskuRow {
  id: PskuId;

  // 真实镜像/绑定接口要求 platform
  platform: string;

  // list 接口是 /stores/{store_id}/platform-skus
  // mirror/binding 接口用 shop_id；这里默认 shop_id == store_id
  store_id: number;
  store_name?: string | null;

  mirror: PskuMirror | null;
  mirror_freshness: MirrorFreshness;

  current_binding: PskuBinding | null;
}

export interface PskuListResponse {
  items: PskuRow[];
  total: number;
}

export interface FskuPickerOption {
  id: number;
  code: string;
  name: string;
  status: FskuStatus;
}

export interface BindingHistoryItem {
  at: string;
  by?: string | null;
  from_fsku?: FskuRef | null;
  to_fsku?: FskuRef | null;
  note?: string | null;
}

export interface PskuDetail {
  psku: PskuRow;
  history: BindingHistoryItem[];
}
