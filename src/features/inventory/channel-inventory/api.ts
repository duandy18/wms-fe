// src/features/inventory/channel-inventory/api.ts
import { apiGet } from "../../../lib/api";
import type {
  ChannelInventorySingle,
  ChannelInventoryMultiModel,
} from "./types";

// 单仓可售：/channel-inventory/{platform}/{shop_id}/{warehouse_id}/{item_id}
export async function fetchSingleInventory(params: {
  platform: string;
  shopId: string;
  warehouseId: number;
  itemId: number;
}): Promise<ChannelInventorySingle> {
  const { platform, shopId, warehouseId, itemId } = params;
  const url = `/channel-inventory/${encodeURIComponent(
    platform,
  )}/${encodeURIComponent(shopId)}/${warehouseId}/${itemId}`;
  return apiGet<ChannelInventorySingle>(url);
}

// 多仓可售：/channel-inventory/{platform}/{shop_id}/item/{item_id}
export async function fetchMultiInventory(params: {
  platform: string;
  shopId: string;
  itemId: number;
}): Promise<ChannelInventoryMultiModel> {
  const { platform, shopId, itemId } = params;
  const url = `/channel-inventory/${encodeURIComponent(
    platform,
  )}/${encodeURIComponent(shopId)}/item/${itemId}`;
  return apiGet<ChannelInventoryMultiModel>(url);
}
