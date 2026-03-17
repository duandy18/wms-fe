// src/features/tms/reconciliation/api.ts

import type {
  ReconcileCarrierBillIn,
  ReconcileCarrierBillResult,
} from "./types";

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
