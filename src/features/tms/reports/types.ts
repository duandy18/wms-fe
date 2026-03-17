// src/features/tms/reports/types.ts

export interface ShippingByCarrierRow {
  carrier_code: string | null;
  carrier_name: string | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingByProvinceRow {
  province: string | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingByShopRow {
  platform: string;
  shop_id: string;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingByWarehouseRow {
  warehouse_id: number | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingDailyRow {
  stat_date: string;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingByCarrierResponse {
  ok: boolean;
  rows: ShippingByCarrierRow[];
}

export interface ShippingByProvinceResponse {
  ok: boolean;
  rows: ShippingByProvinceRow[];
}

export interface ShippingByShopResponse {
  ok: boolean;
  rows: ShippingByShopRow[];
}

export interface ShippingByWarehouseResponse {
  ok: boolean;
  rows: ShippingByWarehouseRow[];
}

export interface ShippingDailyResponse {
  ok: boolean;
  rows: ShippingDailyRow[];
}

export interface ShippingReportFilterOptions {
  platforms: string[];
  shop_ids: string[];
  provinces: string[];
  cities: string[];
}

export interface TransportReportsQuery {
  from_date?: string;
  to_date?: string;
  platform?: string;
  shop_id?: string;
  carrier_code?: string;
  province?: string;
  warehouse_id?: number;
  city?: string;
}
