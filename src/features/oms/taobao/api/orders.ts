import { apiGet } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type {
  TaobaoOrderLedgerDetail,
  TaobaoOrderLedgerRow,
} from "../types/orders";

export async function fetchTaobaoOrderLedgerList(): Promise<TaobaoOrderLedgerRow[]> {
  const resp = await apiGet<{ ok: boolean; data: TaobaoOrderLedgerRow[] }>(
    "/oms/taobao/orders",
  );
  return assertOk(resp, "GET /oms/taobao/orders");
}

export async function fetchTaobaoOrderLedgerDetail(
  taobaoOrderId: number,
): Promise<TaobaoOrderLedgerDetail> {
  const resp = await apiGet<{ ok: boolean; data: TaobaoOrderLedgerDetail }>(
    `/oms/taobao/orders/${taobaoOrderId}`,
  );
  return assertOk(resp, "GET /oms/taobao/orders/{taobao_order_id}");
}
