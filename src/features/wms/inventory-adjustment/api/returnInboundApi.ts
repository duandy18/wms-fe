import { apiGet } from "../../../../lib/api";
import type {
  ReturnOrderRefDetailOut,
  ReturnOrderRefItemOut,
} from "../contracts/returnInbound";

export async function fetchReturnOrderRefs(params?: {
  warehouse_id?: number | null;
  days?: number;
  limit?: number;
}): Promise<ReturnOrderRefItemOut[]> {
  const qs = new URLSearchParams();

  if (params?.warehouse_id != null) {
    qs.set("warehouse_id", String(params.warehouse_id));
  }
  if (params?.days != null) {
    qs.set("days", String(params.days));
  }
  if (params?.limit != null) {
    qs.set("limit", String(params.limit));
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<ReturnOrderRefItemOut[]>(`/return-tasks/order-refs${suffix}`);
}

export async function fetchReturnOrderRefDetail(
  orderRef: string,
  warehouseId?: number | null,
): Promise<ReturnOrderRefDetailOut> {
  const qs = new URLSearchParams();
  if (warehouseId != null) {
    qs.set("warehouse_id", String(warehouseId));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<ReturnOrderRefDetailOut>(
    `/return-tasks/order-refs/${encodeURIComponent(orderRef)}/detail${suffix}`,
  );
}
