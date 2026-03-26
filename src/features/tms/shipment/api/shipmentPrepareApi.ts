// src/features/tms/shipment/api/shipmentPrepareApi.ts
import { apiGet, apiPatch, apiPost } from "../../../../lib/api";

export interface ShipPrepareImportRequest {
  platform: string;
  shop_id: string;
  ext_order_no: string;
  address_ready_status: "pending" | "ready" | string;
}

export interface ShipPrepareImportResponse {
  ok: boolean;
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  address_ready_status: "pending" | "ready" | string;
}

export interface ShipPrepareOrderListItem {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  detail?: string | null;
  address_summary: string;
}

export interface ShipPrepareOrdersListResponse {
  ok: boolean;
  items: ShipPrepareOrderListItem[];
}

export interface ShipPrepareOrderDetailItem {
  order_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  receiver_name?: string | null;
  receiver_phone?: string | null;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  detail?: string | null;
  address_summary: string;
  address_ready_status: "pending" | "ready" | string;
}

export interface ShipPrepareOrderDetailResponse {
  ok: boolean;
  item: ShipPrepareOrderDetailItem;
}

export interface ShipPreparePackageItem {
  package_no: number;
  weight_kg?: number | null;
  warehouse_id?: number | null;
  pricing_status: "pending" | "calculated" | string;
  selected_provider_id?: number | null;
}

export interface ShipPreparePackagesResponse {
  ok: boolean;
  items: ShipPreparePackageItem[];
}

export interface ShipPreparePackageCreateResponse {
  ok: boolean;
  item: ShipPreparePackageItem;
}

export interface ShipPreparePackageUpdateRequest {
  weight_kg?: number;
  warehouse_id?: number;
}

export interface ShipPreparePackageUpdateResponse {
  ok: boolean;
  item: ShipPreparePackageItem;
}

export interface ShipPrepareQuoteCandidateItem {
  provider_id: number;
  carrier_code?: string | null;
  carrier_name: string;
  template_id: number;
  template_name?: string | null;
  quote_status: string;
  currency?: string | null;
  est_cost?: number | null;
  reasons: string[];
  breakdown?: Record<string, unknown> | null;
  eta?: string | null;
}

export interface ShipPreparePackageQuoteItem {
  package_no: number;
  warehouse_id: number;
  weight_kg: number;
  province?: string | null;
  city?: string | null;
  district?: string | null;
  quotes: ShipPrepareQuoteCandidateItem[];
}

export interface ShipPreparePackageQuoteResponse {
  ok: boolean;
  item: ShipPreparePackageQuoteItem;
}

export interface ShipPreparePackageQuoteConfirmRequest {
  provider_id: number;
}

export interface ShipPreparePackageQuoteConfirmItem {
  package_no: number;
  pricing_status: string;
  selected_provider_id: number;
  selected_quote_snapshot: Record<string, unknown>;
}

export interface ShipPreparePackageQuoteConfirmResponse {
  ok: boolean;
  item: ShipPreparePackageQuoteConfirmItem;
}

export async function importShipmentPrepareOrder(
  payload: ShipPrepareImportRequest,
): Promise<ShipPrepareImportResponse> {
  return apiPost<ShipPrepareImportResponse>(
    "/ship/prepare/orders/import",
    payload,
  );
}

export async function fetchShipmentPrepareOrders(
  limit = 50,
): Promise<ShipPrepareOrdersListResponse> {
  return apiGet<ShipPrepareOrdersListResponse>(
    `/ship/prepare/orders?limit=${limit}`,
  );
}

export async function fetchShipmentPrepareOrderDetail(
  platform: string,
  shop_id: string,
  ext_order_no: string,
): Promise<ShipPrepareOrderDetailResponse> {
  return apiGet<ShipPrepareOrderDetailResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}`,
  );
}

export async function confirmShipmentPrepareOrderAddress(
  platform: string,
  shop_id: string,
  ext_order_no: string,
): Promise<ShipPrepareOrderDetailResponse> {
  return apiPost<ShipPrepareOrderDetailResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/address-confirm`,
    {
      address_ready_status: "ready",
    },
  );
}

export async function fetchShipmentPreparePackages(
  platform: string,
  shop_id: string,
  ext_order_no: string,
): Promise<ShipPreparePackagesResponse> {
  return apiGet<ShipPreparePackagesResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/packages`,
  );
}

export async function createShipmentPreparePackage(
  platform: string,
  shop_id: string,
  ext_order_no: string,
): Promise<ShipPreparePackageCreateResponse> {
  return apiPost<ShipPreparePackageCreateResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/packages`,
    {},
  );
}

export async function updateShipmentPreparePackage(
  platform: string,
  shop_id: string,
  ext_order_no: string,
  package_no: number,
  payload: ShipPreparePackageUpdateRequest,
): Promise<ShipPreparePackageUpdateResponse> {
  return apiPatch<ShipPreparePackageUpdateResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/packages/${package_no}`,
    payload,
  );
}

export async function quoteShipmentPreparePackage(
  platform: string,
  shop_id: string,
  ext_order_no: string,
  package_no: number,
): Promise<ShipPreparePackageQuoteResponse> {
  return apiPost<ShipPreparePackageQuoteResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/packages/${package_no}/quote`,
    {},
  );
}

export async function confirmShipmentPreparePackageQuote(
  platform: string,
  shop_id: string,
  ext_order_no: string,
  package_no: number,
  payload: ShipPreparePackageQuoteConfirmRequest,
): Promise<ShipPreparePackageQuoteConfirmResponse> {
  return apiPost<ShipPreparePackageQuoteConfirmResponse>(
    `/ship/prepare/orders/${encodeURIComponent(platform)}/${encodeURIComponent(
      shop_id,
    )}/${encodeURIComponent(ext_order_no)}/packages/${package_no}/quote/confirm`,
    payload,
  );
}
