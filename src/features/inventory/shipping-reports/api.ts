// src/features/inventory/shipping-reports/api.ts
import { apiGet } from "../../../lib/api";

export interface ShippingCarrierRow {
  carrier_code: string | null;
  carrier_name: string | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingCarrierResponse {
  ok: boolean;
  rows: ShippingCarrierRow[];
}

export interface ShippingProvinceRow {
  province: string | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingProvinceResponse {
  ok: boolean;
  rows: ShippingProvinceRow[];
}

export interface ShippingShopRow {
  platform: string;
  shop_id: string;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingShopResponse {
  ok: boolean;
  rows: ShippingShopRow[];
}

export interface ShippingWarehouseRow {
  warehouse_id: number | null;
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingWarehouseResponse {
  ok: boolean;
  rows: ShippingWarehouseRow[];
}

export interface ShippingDailyRow {
  stat_date: string; // YYYY-MM-DD
  ship_cnt: number;
  total_cost: number;
  avg_cost: number;
}

export interface ShippingDailyResponse {
  ok: boolean;
  rows: ShippingDailyRow[];
}

export interface ShippingListRow {
  id: number;
  order_ref: string;
  platform: string;
  shop_id: string;
  warehouse_id?: number | null;
  trace_id?: string | null;
  carrier_code?: string | null;
  carrier_name?: string | null;
  gross_weight_kg?: number | null;
  packaging_weight_kg?: number | null;
  cost_estimated?: number | null;
  status?: string | null;
  meta?: Record<string, unknown> | null;
  created_at: string;
}

export interface ShippingListResponse {
  ok: boolean;
  rows: ShippingListRow[];
  total: number;
}

/**
 * 报表通用查询参数：
 * - from_date / to_date: YYYY-MM-DD
 * - platform: 平台（PDD / JD）
 * - shop_id: 店铺 ID
 * - carrier_code: 快递公司编码
 * - province / city / district: 目的地
 * - warehouse_id: 仓库 ID
 * - limit / offset: 分页（明细列表用）
 */
export interface ShippingReportQuery {
  from_date?: string;
  to_date?: string;
  platform?: string;
  shop_id?: string;
  carrier_code?: string;
  province?: string;
  warehouse_id?: number;
  city?: string;
  district?: string;
  limit?: number;
  offset?: number;
}

export async function fetchShippingByCarrier(
  params: ShippingReportQuery,
): Promise<ShippingCarrierResponse> {
  return apiGet<ShippingCarrierResponse>("/shipping-reports/by-carrier", params);
}

export async function fetchShippingByProvince(
  params: ShippingReportQuery,
): Promise<ShippingProvinceResponse> {
  return apiGet<ShippingProvinceResponse>(
    "/shipping-reports/by-province",
    params,
  );
}

export async function fetchShippingByShop(
  params: ShippingReportQuery,
): Promise<ShippingShopResponse> {
  return apiGet<ShippingShopResponse>("/shipping-reports/by-shop", params);
}

export async function fetchShippingByWarehouse(
  params: ShippingReportQuery,
): Promise<ShippingWarehouseResponse> {
  return apiGet<ShippingWarehouseResponse>(
    "/shipping-reports/by-warehouse",
    params,
  );
}

export async function fetchShippingDaily(
  params: ShippingReportQuery,
): Promise<ShippingDailyResponse> {
  return apiGet<ShippingDailyResponse>("/shipping-reports/daily", params);
}

export async function fetchShippingList(
  params: ShippingReportQuery,
): Promise<ShippingListResponse> {
  return apiGet<ShippingListResponse>("/shipping-reports/list", params);
}

// 下拉选项
export interface ShippingReportFilterOptions {
  platforms: string[];
  shop_ids: string[];
  provinces: string[];
  cities: string[];
}

export async function fetchShippingReportOptions(
  params: Pick<ShippingReportQuery, "from_date" | "to_date" | "warehouse_id">,
): Promise<ShippingReportFilterOptions> {
  return apiGet<ShippingReportFilterOptions>("/shipping-reports/options", params);
}
