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

/**
 * 旧：店铺局部列表（/stores/{store_id}/platform-skus）
 * 先保留类型，避免未来别处引用时被误伤。
 */
export interface PskuRow {
  id: PskuId;

  // mirror / binding 查询需要 platform
  platform: string;

  // list 接口：/stores/{store_id}/platform-skus
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

/**
 * ✅ 新：治理总表（/psku-governance）
 * 后端是“刚性契约”：平铺字段 + governance/action_hint/bind_ctx
 */
export type PskuGovernanceStatus = "BOUND" | "UNBOUND" | "LEGACY_ITEM_BOUND";
export type PskuGovernanceAction = "OK" | "BIND_FIRST" | "MIGRATE_LEGACY";
export type PskuGovernanceRequired = "fsku_id" | "binding_id" | "to_fsku_id";
export type PskuGovernanceMirrorFreshness = "ok" | "missing";

export interface PskuGovernanceActionHint {
  action: PskuGovernanceAction;
  required: PskuGovernanceRequired[];
}

export interface PskuBindCtx {
  suggest_q: string;
  suggest_fsku_query: string;
}

export interface PskuGovernanceRow {
  platform: string;
  store_id: number;
  store_name?: string | null;

  platform_sku_id: string;
  sku_name?: string | null;
  spec?: string | null;

  mirror_freshness: PskuGovernanceMirrorFreshness;

  binding_id?: number | null;

  fsku_id?: number | null;
  fsku_code?: string | null;
  fsku_name?: string | null;
  fsku_status?: string | null;

  governance: { status: PskuGovernanceStatus };
  action_hint: PskuGovernanceActionHint;

  bind_ctx?: PskuBindCtx | null;

  component_item_ids: number[];
}

export interface PskuGovernanceOut {
  items: PskuGovernanceRow[];
  total: number;
  limit: number;
  offset: number;
}
