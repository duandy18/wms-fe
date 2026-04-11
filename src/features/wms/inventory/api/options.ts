import { apiGet } from "@/lib/api";
import type { InventoryOptionsResponse } from "./contracts";

export async function fetchInventoryOptions(params?: {
  item_q?: string;
  item_limit?: number;
  warehouses_active_only?: boolean;
}): Promise<InventoryOptionsResponse> {
  const qs = new URLSearchParams();

  if (params?.item_q) qs.set("item_q", params.item_q);
  if (params?.item_limit) qs.set("item_limit", String(params.item_limit));
  if (params?.warehouses_active_only !== undefined) {
    qs.set(
      "warehouses_active_only",
      params.warehouses_active_only ? "true" : "false",
    );
  }

  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiGet<InventoryOptionsResponse>(`/stock/options${suffix}`);
}
