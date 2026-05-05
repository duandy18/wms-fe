// src/features/oms/fsku/types.ts

export type Platform = "PDD" | "JD" | "TMALL" | "OTHER";

// 后端合同：draft / published / retired
export type FskuStatus = "draft" | "published" | "retired";

// ✅ Phase A：components.role = primary | gift
export type FskuComponentRole = "primary" | "gift";

export type FskuComponent = {
  item_id: number;
  qty: number;
  role: FskuComponentRole;
};

export type FskuShape = "single" | "bundle";

export type Fsku = {
  id: number;
  code: string;
  name: string;
  shape: FskuShape;
  status: FskuStatus;

  components_summary: string;
  components_summary_name?: string;

  published_at: string | null;
  retired_at: string | null;
  updated_at: string;
  unit_label?: string;
};

export type FskuDetail = Fsku & {
  components?: FskuComponent[];
};

export type MasterItem = {
  id: number;
  sku: string;
  name: string;
  brand: string | null;
};

export type PlatformSkuBinding = {
  id: number | string;
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  fsku_id: number;
  effective_from: string;
  effective_to: string | null;
  reason: string;
};

export type PlatformMirrorLine = {
  platform_sku_id?: string | null;
  item_name?: string | null;
  spec?: string | null;
  quantity?: number | null;
};

export type PlatformMirror = {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  raw: unknown;
  lines: PlatformMirrorLine[];
};

export type ApiProblem = {
  error_code?: string;
  message?: string;
  http_status?: number;
  trace_id?: string;
  context?: unknown;
};

export type FskuLite = {
  id: number;
  code: string;
  name: string;
  status: FskuStatus | string;
};

export type StoreLite = {
  id: number;
  store_name: string;
};

