import { apiGet } from "@/lib/api";
import type {
  InventoryDetailQuery,
  InventoryDetailResponse,
  InventoryPageQuery,
  InventoryResponse,
} from "./contracts";

export async function fetchInventoryPage(
  query: InventoryPageQuery,
): Promise<InventoryResponse> {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.item_id) params.set("item_id", String(query.item_id));
  if (query.warehouse_id) params.set("warehouse_id", String(query.warehouse_id));
  if (query.lot_code) params.set("lot_code", query.lot_code);
  if (query.near_expiry === true) params.set("near_expiry", "true");

  params.set("offset", String(query.offset ?? 0));
  params.set("limit", String(query.limit ?? 20));

  return apiGet<InventoryResponse>(`/stock/inventory?${params.toString()}`);
}

export async function fetchInventoryItemDetail(
  itemId: number,
  query: InventoryDetailQuery = {},
): Promise<InventoryDetailResponse> {
  const params = new URLSearchParams();

  if (query.warehouse_id) params.set("warehouse_id", String(query.warehouse_id));
  if (query.lot_code) params.set("lot_code", query.lot_code);
  if (query.pools && query.pools.length > 0) {
    params.set("pools", query.pools.join(","));
  } else {
    params.set("pools", "MAIN");
  }

  return apiGet<InventoryDetailResponse>(
    `/stock/inventory/${itemId}/detail?${params.toString()}`,
  );
}
