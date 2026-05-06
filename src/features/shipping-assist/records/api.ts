// src/features/shipping-assist/records/api.ts

import { apiGet, apiPost, apiRequestBlob } from "../../../lib/api";
import type {
  ShippingLedgerListResponse,
  ShippingLedgerQuery,
  SyncLogisticsShippingRecordsInput,
  SyncLogisticsShippingRecordsResponse,
} from "./types";

function buildExportQueryString(query: ShippingLedgerQuery): string {
  const search = new URLSearchParams();

  const appendIfPresent = (
    key: string,
    value: string | number | undefined,
  ): void => {
    if (value === undefined || value === "") {
      return;
    }
    search.set(key, String(value));
  };

  appendIfPresent("from_date", query.from_date);
  appendIfPresent("to_date", query.to_date);
  appendIfPresent("order_ref", query.order_ref);
  appendIfPresent("tracking_no", query.tracking_no);
  appendIfPresent("shipping_provider_code", query.shipping_provider_code);
  appendIfPresent("shipping_provider_id", query.shipping_provider_id);
  appendIfPresent("province", query.province);
  appendIfPresent("city", query.city);
  appendIfPresent("warehouse_id", query.warehouse_id);
  appendIfPresent("limit", query.limit);
  appendIfPresent("offset", query.offset);

  return search.toString();
}

export async function fetchShippingLedger(
  query: ShippingLedgerQuery,
): Promise<ShippingLedgerListResponse> {
  return await apiGet<ShippingLedgerListResponse>(
    "/shipping-assist/records",
    query,
  );
}

export async function exportShippingLedgerCsv(
  query: ShippingLedgerQuery,
): Promise<Blob> {
  const qs = buildExportQueryString(query);
  const path = qs
    ? `/shipping-assist/records/export?${qs}`
    : "/shipping-assist/records/export";

  return await apiRequestBlob(path, {
    method: "GET",
    headers: {
      Accept: "text/csv",
    },
  });
}

export async function syncLogisticsShippingRecords(
  payload: SyncLogisticsShippingRecordsInput = { limit: 100 },
): Promise<SyncLogisticsShippingRecordsResponse> {
  return await apiPost<SyncLogisticsShippingRecordsResponse>(
    "/shipping-assist/records/sync-from-logistics",
    payload,
  );
}
