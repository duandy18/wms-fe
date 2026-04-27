import { poiRequest } from "../../../shared/api/http";
import type {
  TaobaoOrderLedgerDetail,
  TaobaoOrderLedgerRow,
} from "../contracts/taobaoNativeOrders";

export async function fetchTaobaoNativeOrders(params: {
  limit?: number;
  offset?: number;
}): Promise<TaobaoOrderLedgerRow[]> {
  return poiRequest<TaobaoOrderLedgerRow[]>("/oms/taobao/orders", {
    query: {
      limit: params.limit ?? 200,
      offset: params.offset ?? 0,
    },
    ctx: "GET /oms/taobao/orders",
  });
}

export async function fetchTaobaoNativeOrderDetail(
  taobaoOrderId: number,
): Promise<TaobaoOrderLedgerDetail> {
  return poiRequest<TaobaoOrderLedgerDetail>(
    `/oms/taobao/orders/${taobaoOrderId}`,
    {
      ctx: "GET /oms/taobao/orders/{taobao_order_id}",
    },
  );
}
