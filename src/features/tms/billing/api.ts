// src/features/tms/billing/api.ts

import type {
  CarrierBillImportResult,
  CarrierBillItemsQuery,
  CarrierBillItemsResponse,
  ReconcileCarrierBillIn,
  ReconcileCarrierBillResult,
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

function buildItemsQueryString(query: CarrierBillItemsQuery): string {
  const params = new URLSearchParams();
  appendIfPresent(params, "import_batch_no", query.import_batch_no);
  appendIfPresent(params, "carrier_code", query.carrier_code);
  appendIfPresent(params, "tracking_no", query.tracking_no);
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
    // ignore
  }

  throw new Error(message);
}

export async function importCarrierBill(
  formData: FormData,
): Promise<CarrierBillImportResult> {
  const response = await fetch("/shipping-bills/import", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  await ensureOk(response);
  return (await response.json()) as CarrierBillImportResult;
}

export async function fetchCarrierBillItems(
  query: CarrierBillItemsQuery,
): Promise<CarrierBillItemsResponse> {
  const qs = buildItemsQueryString(query);
  const url = qs ? `/shipping-bills/items?${qs}` : "/shipping-bills/items";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  await ensureOk(response);
  return (await response.json()) as CarrierBillItemsResponse;
}

export async function reconcileCarrierBill(
  payload: ReconcileCarrierBillIn,
): Promise<ReconcileCarrierBillResult> {
  const response = await fetch("/shipping-bills/reconcile", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  await ensureOk(response);
  return (await response.json()) as ReconcileCarrierBillResult;
}
