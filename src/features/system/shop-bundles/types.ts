// src/features/system/shop-bundles/types.ts

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

export type Fsku = {
  id: number; // ✅ 合同：int
  name: string;
  unit_label: string;
  status: FskuStatus;

  // ✅ 合同：/fskus list 返回 updated_at（你 curl 已验证）
  updated_at: string; // ISO
};

export type FskuDetail = Fsku & {
  // 详情是否带 components 由后端决定
  components?: FskuComponent[];
};

// ✅ 主商品数据（items）最小合同（供 FSKU components 选择器使用）
// 注意：字段名严格对齐后端 /items 返回
export type MasterItem = {
  id: number;

  sku: string;
  name: string;

  barcode: string | null; // 主条码
  brand: string | null; // 品牌
  uom: string | null; // 最小包装单位（后端字段名为 uom）
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

// mirror（本刀不变）
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

// ✅ Problem shape（合同）
export type ApiProblem = {
  error_code?: string;
  message?: string;
  http_status?: number;
  trace_id?: string;
  context?: unknown;
};
