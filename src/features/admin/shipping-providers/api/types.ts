// src/features/admin/shipping-providers/api/types.ts

// ======================================================
// Common response wrappers
// ======================================================

export interface ListResponse<T> {
  ok: boolean;
  data: T[];
}

export interface OneResponse<T> {
  ok: boolean;
  data: T;
}

// ======================================================
// Shipping Provider
// ======================================================

export interface ShippingProviderContact {
  id: number;
  shipping_provider_id: number;

  name?: string | null;
  phone?: string | null;
  email?: string | null;

  // UI 使用字段（历史存在）
  role?: string | null;
  wechat?: string | null;

  active?: boolean;
  is_primary?: boolean;
}

export interface ShippingProvider {
  id: number;
  name: string;

  // 基础状态
  active?: boolean;

  // 历史 / UI 使用字段
  code?: string | null;
  address?: string | null;
  warehouse_id?: number | null;
  priority?: number | null;

  contacts?: ShippingProviderContact[];
}

// ======================================================
// Scheme / Pricing
// ======================================================

export interface WeightSegment {
  min: string;
  max: string | null;
}

export interface PricingSchemeSegment {
  id: number;
  scheme_id: number;
  ord: number;
  min_kg: number;
  max_kg: number | null;
  active: boolean;
}

export interface PricingScheme {
  id: number;
  shipping_provider_id: number;
  name: string;

  // UI 需要
  active?: boolean;
  archived_at?: string | null;

  // 扩展 / 排序字段
  priority?: number | null;

  currency?: string;
  default_pricing_mode?: string;
}

export interface PricingSchemeZoneMember {
  id: number;
  zone_id: number;
  level: string;
  value: string;
}

export interface PricingSchemeZoneBracket {
  id: number;
  zone_id: number;
  min_kg: number;
  max_kg: number | null;
  pricing_mode: string;
  flat_amount: number | null;
  base_amount: number | null;
  rate_per_kg: number | null;
  base_kg?: number | null;
  price_json: Record<string, unknown>;
  active: boolean;
}

export interface PricingSchemeZone {
  id: number;
  scheme_id: number;
  name: string;
  active: boolean;

  // Zone 显式绑定段模板
  segment_template_id?: number | null;

  members: PricingSchemeZoneMember[];
  brackets: PricingSchemeZoneBracket[];
}

export interface PricingSchemeSurcharge {
  id: number;
  scheme_id: number;
  name: string;
  active: boolean;
  condition_json: Record<string, unknown>;
  amount_json: Record<string, unknown>;
}

// ======================================================
// Scheme Detail / List（核心）
// ======================================================

export interface PricingSchemeDetail extends PricingScheme {
  shipping_provider_name: string;

  effective_from?: string | null;
  effective_to?: string | null;

  billable_weight_rule?: Record<string, unknown> | null;

  // ✅ 本次主线新增：显式默认回退模板
  default_segment_template_id?: number | null;

  segments_json?: WeightSegment[] | null;
  segments_updated_at?: string | null;

  segments: PricingSchemeSegment[];
  zones: PricingSchemeZone[];
  surcharges: PricingSchemeSurcharge[];
}

export type SchemeListResponse = ListResponse<PricingScheme>;
export type SchemeDetailResponse = OneResponse<PricingSchemeDetail>;
