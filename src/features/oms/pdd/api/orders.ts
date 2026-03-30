import { apiGet } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type { PddOrderLedgerDetail, PddOrderLedgerRow } from "../types/orders";

export async function fetchPddOrderLedgerList(): Promise<PddOrderLedgerRow[]> {
  const resp = await apiGet<{ ok: boolean; data: PddOrderLedgerRow[] }>(
    "/oms/pdd/orders",
  );
  return assertOk(resp, "GET /oms/pdd/orders");
}

export async function fetchPddOrderLedgerDetail(
  pddOrderId: number,
): Promise<PddOrderLedgerDetail> {
  const resp = await apiGet<{ ok: boolean; data: PddOrderLedgerDetail }>(
    `/oms/pdd/orders/${pddOrderId}`,
  );
  return assertOk(resp, "GET /oms/pdd/orders/{pdd_order_id}");
}
