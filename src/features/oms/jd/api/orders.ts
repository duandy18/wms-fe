import { apiGet } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type { JdOrderLedgerDetail, JdOrderLedgerRow } from "../types/orders";

export async function fetchJdOrderLedgerList(): Promise<JdOrderLedgerRow[]> {
  const resp = await apiGet<{ ok: boolean; data: JdOrderLedgerRow[] }>(
    "/oms/jd/orders",
  );
  return assertOk(resp, "GET /oms/jd/orders");
}

export async function fetchJdOrderLedgerDetail(
  jdOrderId: number,
): Promise<JdOrderLedgerDetail> {
  const resp = await apiGet<{ ok: boolean; data: JdOrderLedgerDetail }>(
    `/oms/jd/orders/${jdOrderId}`,
  );
  return assertOk(resp, "GET /oms/jd/orders/{jd_order_id}");
}
