import { poiRequest } from "../../../shared/api/http";
import type {
  PddOrderLedgerDetail,
  PddOrderLedgerRow,
} from "../contracts/pddNativeOrders";

export async function fetchPddNativeOrders(params: {
  limit?: number;
  offset?: number;
}): Promise<PddOrderLedgerRow[]> {
  return poiRequest<PddOrderLedgerRow[]>("/oms/pdd/orders", {
    query: {
      limit: params.limit ?? 200,
      offset: params.offset ?? 0,
    },
    ctx: "GET /oms/pdd/orders",
  });
}

export async function fetchPddNativeOrderDetail(
  pddOrderId: number,
): Promise<PddOrderLedgerDetail> {
  return poiRequest<PddOrderLedgerDetail>(`/oms/pdd/orders/${pddOrderId}`, {
    ctx: "GET /oms/pdd/orders/{pdd_order_id}",
  });
}
