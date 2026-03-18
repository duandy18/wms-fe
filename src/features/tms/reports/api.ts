// src/features/tms/reports/api.ts

import { apiGet } from "../../../lib/api";
import type {
  ShippingByCarrierResponse,
  ShippingByProvinceResponse,
  ShippingByShopResponse,
  ShippingByWarehouseResponse,
  ShippingDailyResponse,
  ShippingReportFilterOptions,
  TransportReportsQuery,
} from "./types";

export async function fetchShippingByCarrier(
  query: TransportReportsQuery,
): Promise<ShippingByCarrierResponse> {
  return await apiGet<ShippingByCarrierResponse>(
    "/shipping-reports/by-carrier",
    query,
  );
}

export async function fetchShippingByProvince(
  query: TransportReportsQuery,
): Promise<ShippingByProvinceResponse> {
  return await apiGet<ShippingByProvinceResponse>(
    "/shipping-reports/by-province",
    query,
  );
}

export async function fetchShippingByShop(
  query: TransportReportsQuery,
): Promise<ShippingByShopResponse> {
  return await apiGet<ShippingByShopResponse>("/shipping-reports/by-shop", query);
}

export async function fetchShippingByWarehouse(
  query: TransportReportsQuery,
): Promise<ShippingByWarehouseResponse> {
  return await apiGet<ShippingByWarehouseResponse>(
    "/shipping-reports/by-warehouse",
    query,
  );
}

export async function fetchShippingDaily(
  query: TransportReportsQuery,
): Promise<ShippingDailyResponse> {
  return await apiGet<ShippingDailyResponse>("/shipping-reports/daily", query);
}

export async function fetchShippingReportOptions(
  query: Pick<TransportReportsQuery, "from_date" | "to_date" | "warehouse_id">,
): Promise<ShippingReportFilterOptions> {
  return await apiGet<ShippingReportFilterOptions>(
    "/shipping-reports/options",
    query,
  );
}
