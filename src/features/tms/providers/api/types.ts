// src/features/tms/providers/api/types.ts

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
  company_code?: string | null;
  resource_code?: string | null;
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
  shipping_provider_name?: string;
  warehouse_id?: number;
  name: string;

  // 新主线：status 真相字段
  status?: "draft" | "active" | "archived" | string;
  archived_at?: string | null;

  // 兼容旧 UI
  active?: boolean;

  // 扩展 / 排序字段
  priority?: number | null;

  currency?: string;
  default_pricing_mode?: string;

  effective_from?: string | null;
  effective_to?: string | null;

  billable_weight_strategy?: string;
  volume_divisor?: number | null;
  rounding_mode?: string;
  rounding_step_kg?: number | null;
  min_billable_weight_kg?: number | null;
}

export interface PricingSchemeZoneMember {
  id: number;
  zone_id: number;
  level: string;
  value: string;
}

export interface PricingSchemeZone {
  id: number;
  scheme_id: number;
  name: string;
  active: boolean;
  members: PricingSchemeZoneMember[];
}

// ======================================================
// Surcharge Config（新主线）
// ======================================================

export interface PricingSchemeSurchargeConfigCity {
  id: number;
  config_id: number;
  city_code: string;
  city_name: string | null;
  fixed_amount: number;
  active: boolean;
}

export interface PricingSchemeSurchargeConfig {
  id: number;
  scheme_id: number;
  province_code: string;
  province_name: string | null;
  province_mode: "province" | "cities";
  fixed_amount: number;
  active: boolean;
  cities: PricingSchemeSurchargeConfigCity[];
}

// ✅ 新：目的地附加费（结构化事实）——已切换为标准 code 世界
export interface PricingSchemeDestAdjustment {
  id: number;
  scheme_id: number;
  scope: "province" | "city";

  // ✅ 事实口径：GB2260 码（省：xx0000；市：xxxx00）
  province_code: string;
  city_code: string | null;

  // ✅ 展示冗余：后端已按字典补全
  province_name: string | null;
  city_name: string | null;

  // ✅ 兼容输出：旧字段仍返回一段时间
  province: string;
  city: string | null;

  amount: number;
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

// ======================================================
// 共享目的地组类型（新工作台 / 只读详情仍可复用）
// ======================================================

export interface PricingSchemeDestinationGroupProvince {
  id: number;
  group_id: number;
  province_code?: string | null;
  province_name?: string | null;
}

export interface PricingSchemeDestinationGroup {
  id: number;
  group_key: string;
  scheme_id: number;
  module_id: number;
  module_key: string;
  name: string;
  sort_order: number;
  active: boolean;
  provinces: PricingSchemeDestinationGroupProvince[];
}

// ======================================================
// Scheme Detail / List（核心）
// ======================================================

export interface PricingSchemeDetail extends PricingScheme {
  shipping_provider_name: string;

  effective_from?: string | null;
  effective_to?: string | null;

  billable_weight_strategy?: string;
  volume_divisor?: number | null;
  rounding_mode?: string;
  rounding_step_kg?: number | null;
  min_billable_weight_kg?: number | null;

  // 当前主线字段
  zones: PricingSchemeZone[];
  surcharge_configs: PricingSchemeSurchargeConfig[];

  // 新主线只读字段
  destination_groups?: PricingSchemeDestinationGroup[];

  // ✅ 新：目的地附加费（结构化事实）
}

export type SchemeListResponse = ListResponse<PricingScheme>;
export type SchemeDetailResponse = OneResponse<PricingSchemeDetail>;
