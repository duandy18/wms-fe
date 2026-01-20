// src/features/admin/warehouses/types.ts

export interface WarehouseListItem {
  id: number;
  name: string;
  code: string | null;
  active: boolean;

  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
}

export interface WarehouseListResponse {
  ok: boolean;
  data: WarehouseListItem[];
}

export interface WarehouseDetailResponse {
  ok: boolean;
  data: WarehouseListItem;
}

/**
 * 仓库服务省份（唯一映射事实）
 * - 省份（province_code）全局互斥：一个省只能属于一个仓
 */
export interface WarehouseServiceProvinces {
  warehouse_id: number;
  provinces: string[];
}

export interface WarehouseServiceProvincesPutIn {
  provinces: string[];
}

/**
 * 省份占用情况（只读）
 */
export interface WarehouseServiceProvinceOccupancyRow {
  province_code: string;
  warehouse_id: number;
}

export interface WarehouseServiceProvinceOccupancyOut {
  rows: WarehouseServiceProvinceOccupancyRow[];
}

/**
 * 仓库服务城市（唯一映射事实）
 * - 城市（city_code）全局互斥：一个城市只能属于一个仓
 */
export interface WarehouseServiceCities {
  warehouse_id: number;
  cities: string[];
}

export interface WarehouseServiceCitiesPutIn {
  cities: string[];
}

/**
 * 城市占用情况（只读）
 */
export interface WarehouseServiceCityOccupancyRow {
  city_code: string;
  warehouse_id: number;
}

export interface WarehouseServiceCityOccupancyOut {
  rows: WarehouseServiceCityOccupancyRow[];
}

/**
 * 省份“按城市细分”开关（全局）
 * - 在该列表里的省：省级规则冻结，只允许城市命中
 */
export interface WarehouseServiceCitySplitProvincesOut {
  provinces: string[];
}

export interface WarehouseServiceCitySplitProvincesPutIn {
  provinces: string[];
}

/**
 * Phase 3 延展：新建=完整事实输入
 */
export interface WarehouseCreatePayload {
  name: string;
  code: string;

  active: boolean;

  address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  area_sqm: number | null;
}

export interface WarehouseUpdatePayload {
  name?: string | null;
  code?: string | null;
  active?: boolean;

  address?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  area_sqm?: number | null;
}

// =========================================
// Phase 1：仓库 × 快递公司（事实绑定）
// =========================================

export interface ShippingProviderListItem {
  id: number;
  name: string;
  code: string | null;
  active: boolean;
}

export interface ShippingProviderListOut {
  ok: boolean;
  data: ShippingProviderListItem[];
}

export interface WarehouseShippingProviderListItem {
  warehouse_id: number;
  shipping_provider_id: number;

  active: boolean;
  priority: number;
  pickup_cutoff_time: string | null;
  remark: string | null;

  provider: ShippingProviderListItem;
}

export interface WarehouseShippingProviderListOut {
  ok: boolean;
  data: WarehouseShippingProviderListItem[];
}

export interface WarehouseShippingProviderBindPayload {
  shipping_provider_id: number;
  active: boolean;
  priority: number;
  pickup_cutoff_time: string | null;
  remark: string | null;
}

export interface WarehouseShippingProviderBindOut {
  ok: boolean;
  data: WarehouseShippingProviderListItem;
}

export interface WarehouseShippingProviderPatchPayload {
  active?: boolean;
  priority?: number;
  pickup_cutoff_time?: string | null;
  remark?: string | null;
}

export interface WarehouseShippingProviderPatchOut {
  ok: boolean;
  data: WarehouseShippingProviderListItem;
}

export interface WarehouseShippingProviderDeleteOut {
  ok: boolean;
  data: { warehouse_id: number; shipping_provider_id: number };
}
