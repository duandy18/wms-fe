// src/features/tms/records/api.ts

import type {
  ShippingLedgerListResponse,
  ShippingLedgerQuery,
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

function buildQueryString(query: ShippingLedgerQuery): string {
  const params = new URLSearchParams();

  appendIfPresent(params, "from_date", query.from_date);
  appendIfPresent(params, "to_date", query.to_date);
  appendIfPresent(params, "order_ref", query.order_ref);
  appendIfPresent(params, "tracking_no", query.tracking_no);
  appendIfPresent(params, "carrier_code", query.carrier_code);
  appendIfPresent(params, "province", query.province);
  appendIfPresent(params, "city", query.city);
  appendIfPresent(params, "warehouse_id", query.warehouse_id);
  appendIfPresent(params, "limit", query.limit);
  appendIfPresent(params, "offset", query.offset);

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
    // ignore json parse failure
  }
  throw new Error(message);
}

export async function fetchShippingLedger(
  query: ShippingLedgerQuery,
): Promise<ShippingLedgerListResponse> {
  const qs = buildQueryString(query);
  const url = qs ? `/tms/records?${qs}` : "/tms/records";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  await ensureOk(response);
  return (await response.json()) as ShippingLedgerListResponse;
}

export async function exportShippingLedgerCsv(
  query: ShippingLedgerQuery,
): Promise<Blob> {
  const qs = buildQueryString(query);
  const url = qs ? `/tms/records/export?${qs}` : "/tms/records/export";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "text/csv",
    },
  });

  await ensureOk(response);
  return await response.blob();
}
