// src/features/tms/reports/api.ts

import type {
  ShippingByCarrierResponse,
  ShippingByProvinceResponse,
  ShippingByShopResponse,
  ShippingByWarehouseResponse,
  ShippingDailyResponse,
  ShippingReportFilterOptions,
  TransportReportsQuery,
} from "./types";

function appendIfPresent(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined,
): void {
  if (value === undefined || value === "") {
    return;
  }
  params.set(key, String(value));
}

function buildQueryString(query: TransportReportsQuery): string {
  const params = new URLSearchParams();

  appendIfPresent(params, "from_date", query.from_date);
  appendIfPresent(params, "to_date", query.to_date);
  appendIfPresent(params, "platform", query.platform);
  appendIfPresent(params, "shop_id", query.shop_id);
  appendIfPresent(params, "carrier_code", query.carrier_code);
  appendIfPresent(params, "province", query.province);
  appendIfPresent(params, "warehouse_id", query.warehouse_id);
  appendIfPresent(params, "city", query.city);

  return params.toString();
}

async function ensureOk(response: Response): Promise<Response> {
  if (response.ok) {
    return response;
  }

  let message = `HTTP ${response.status}`;
  try {
    const data = (await response.json()) as { detail?: string; message?: string };
    message = data.detail ?? data.message ?? message;
  } catch {
    // ignore
  }
  throw new Error(message);
}

async function getJson<T>(path: string, query: TransportReportsQuery): Promise<T> {
  const qs = buildQueryString(query);
  const url = qs ? `${path}?${qs}` : path;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  await ensureOk(response);
  return (await response.json()) as T;
}

export async function fetchShippingByCarrier(
  query: TransportReportsQuery,
): Promise<ShippingByCarrierResponse> {
  return await getJson<ShippingByCarrierResponse>("/shipping-reports/by-carrier", query);
}

export async function fetchShippingByProvince(
  query: TransportReportsQuery,
): Promise<ShippingByProvinceResponse> {
  return await getJson<ShippingByProvinceResponse>("/shipping-reports/by-province", query);
}

export async function fetchShippingByShop(
  query: TransportReportsQuery,
): Promise<ShippingByShopResponse> {
  return await getJson<ShippingByShopResponse>("/shipping-reports/by-shop", query);
}

export async function fetchShippingByWarehouse(
  query: TransportReportsQuery,
): Promise<ShippingByWarehouseResponse> {
  return await getJson<ShippingByWarehouseResponse>("/shipping-reports/by-warehouse", query);
}

export async function fetchShippingDaily(
  query: TransportReportsQuery,
): Promise<ShippingDailyResponse> {
  return await getJson<ShippingDailyResponse>("/shipping-reports/daily", query);
}

export async function fetchShippingReportOptions(
  query: Pick<TransportReportsQuery, "from_date" | "to_date" | "warehouse_id">,
): Promise<ShippingReportFilterOptions> {
  const qs = buildQueryString(query);
  const url = qs ? `/shipping-reports/options?${qs}` : "/shipping-reports/options";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  await ensureOk(response);
  return (await response.json()) as ShippingReportFilterOptions;
}
