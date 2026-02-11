// admin/shop-bundles/types.ts

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
  id: number; // ✅ 合同：int
  code: string;
  name: string;
  shape: FskuShape;
  status: FskuStatus;

  // 后端聚合摘要：
  // - components_summary: SKU 版（工程排查）
  // - components_summary_name: 主数据商品名版（运营/治理展示；可能缺省，用于向后兼容）
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
  barcode: string | null;
  brand: string | null;
  uom: string | null;
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

// -------------------- Merchant Code ↔ FSKU bindings (治理事实) --------------------

export type FskuLite = {
  id: number;
  code: string;
  name: string;
  status: FskuStatus | string;
};

export type StoreLite = {
  id: number;
  name: string;
};

export type MerchantCodeBindingRow = {
  id: number;
  platform: string;
  shop_id: string;

  // ✅ join 展示字段（不落绑定表）
  store: StoreLite;

  merchant_code: string;
  fsku_id: number;
  fsku: FskuLite;

  // ✅ current-only：无 effective_from/effective_to
  reason: string | null;
  created_at: string;
  updated_at: string;
};

export type MerchantCodeBindingsList = {
  items: MerchantCodeBindingRow[];
  total: number;
  limit: number;
  offset: number;
};

export type MerchantCodeBindingsListResp = {
  ok: boolean;
  data: MerchantCodeBindingsList;
};

export type MerchantCodeBindResp = {
  ok: boolean;
  data: MerchantCodeBindingRow;
};
