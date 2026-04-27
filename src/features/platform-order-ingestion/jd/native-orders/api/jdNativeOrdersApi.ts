import { poiRequest } from "../../../shared/api/http";
import type {
  JdOrderLedgerDetail,
  JdOrderLedgerRow,
} from "../contracts/jdNativeOrders";

export async function fetchJdNativeOrders(params: {
  limit?: number;
  offset?: number;
}): Promise<JdOrderLedgerRow[]> {
  return poiRequest<JdOrderLedgerRow[]>("/oms/jd/orders", {
    query: {
      limit: params.limit ?? 200,
      offset: params.offset ?? 0,
    },
    ctx: "GET /oms/jd/orders",
  });
}

export async function fetchJdNativeOrderDetail(
  jdOrderId: number,
): Promise<JdOrderLedgerDetail> {
  return poiRequest<JdOrderLedgerDetail>(`/oms/jd/orders/${jdOrderId}`, {
    ctx: "GET /oms/jd/orders/{jd_order_id}",
  });
}
