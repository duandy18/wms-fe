// src/features/admin/shipping-providers/api.types.ts

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

// ============================
// Pricing Schemes（主数据核心）
// ============================

export interface PricingScheme {
  id: number;
  shipping_provider_id: number;
  name: string;
  active: boolean;
  priority: number;
  currency: string;
  effective_from?: string | null;
  effective_to?: string | null;
  billable_weight_rule?: Record<string, unknown> | null;
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

  // 查表主路径字段（后端输出）
  pricing_mode: "flat" | "linear_total" | "manual_quote" | string;
  flat_amount?: number | null;
  base_amount?: number | null;
  rate_per_kg?: number | null;

  // mirror（后端 DB 保证完整）
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

// ============================
// API Response shape
// ============================

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
