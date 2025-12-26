// src/features/admin/shipping-providers/api/types.ts

// ============================================================
// Shipping Providers / Pricing Schemes API Types
// ============================================================

export interface ShippingProviderContact {
  id: number;
  shipping_provider_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  wechat?: string | null;
  role: string;
  is_primary: boolean;
  active: boolean;
}

export interface ShippingProvider {
  id: number;
  name: string;
  code?: string | null;
  active: boolean;
  priority: number;
  contacts?: ShippingProviderContact[];
}

// ============================================================
// Pricing Schemes（主数据核心）
// ============================================================

export type SchemeDefaultPricingMode = "flat" | "linear_total" | "step_over";

// ✅ Phase 4.3：重量分段（方案级列结构，镜像/兼容）
export interface SchemeWeightSegment {
  min: string;
  max: string; // 空字符串表示 ∞
}

// ✅ Phase 5：旧段表输出（仍保留，用于录价页过滤）
export interface SchemeSegmentOut {
  id: number;
  scheme_id: number;
  ord: number;
  min_kg: string;
  max_kg: string | null;
  active: boolean;
}

// ============================================================
// Segment Templates（路线 1：模板真相）
// ============================================================

export type SegmentTemplateStatus = "draft" | "published" | "archived";

export interface SegmentTemplateItemOut {
  id: number;
  template_id: number;
  ord: number;
  min_kg: string;
  max_kg: string | null;
  active: boolean;
}

export interface SegmentTemplateOut {
  id: number;
  scheme_id: number;
  name: string;
  status: SegmentTemplateStatus | string;
  is_active: boolean;
  effective_from?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items: SegmentTemplateItemOut[];
}

export interface SegmentTemplateListResponse {
  ok: boolean;
  data: SegmentTemplateOut[];
}

export interface SegmentTemplateDetailResponse {
  ok: boolean;
  data: SegmentTemplateOut;
}

// ============================================================
// Scheme Objects
// ============================================================

export interface PricingScheme {
  id: number;
  shipping_provider_id: number;
  name: string;
  active: boolean;
  priority: number;
  currency: string;

  effective_from?: string | null;
  effective_to?: string | null;

  default_pricing_mode: SchemeDefaultPricingMode;

  billable_weight_rule?: Record<string, unknown> | null;

  // 兼容/镜像：启用模板时后端会同步写回
  segments_json?: SchemeWeightSegment[] | null;
  segments_updated_at?: string | null;

  // 旧段表：启用模板时会同步写入
  segments?: SchemeSegmentOut[] | null;
}

export interface PricingSchemeZoneMember {
  id: number;
  zone_id: number;
  level: "province" | "city" | "district" | "text";
  value: string;
}

export interface PricingSchemeZoneBracket {
  id: number;
  zone_id: number;
  min_kg: number;
  max_kg?: number | null;

  pricing_mode: "flat" | "linear_total" | "step_over" | "manual_quote" | string;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;

  base_kg?: number | null;

  price_json: Record<string, unknown>;

  active: boolean;
}

export interface PricingSchemeZone {
  id: number;
  scheme_id: number;
  name: string;
  priority: number;
  active: boolean;
  members: PricingSchemeZoneMember[];
  brackets: PricingSchemeZoneBracket[];
}

export interface PricingSchemeSurcharge {
  id: number;
  scheme_id: number;
  name: string;
  priority: number;
  active: boolean;
  condition_json: Record<string, unknown>;
  amount_json: Record<string, unknown>;
}

export interface PricingSchemeDetail extends PricingScheme {
  zones: PricingSchemeZone[];
  surcharges: PricingSchemeSurcharge[];
}

// ============================================================
// API Response Shapes（通用，给其他 api.* 文件复用）
// ============================================================

export interface ListResponse<T> {
  ok: boolean;
  data: T[];
}

export interface OneResponse<T> {
  ok: boolean;
  data: T;
}

export interface SchemeListResponse {
  ok: boolean;
  data: PricingScheme[];
}

export interface SchemeDetailResponse {
  ok: boolean;
  data: PricingSchemeDetail;
}
