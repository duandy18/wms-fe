// src/features/admin/stores/store-skus/inventoryBatchApi.ts

import { apiPost } from "../../../../lib/api";
import { assertOk } from "../../../../lib/assertOk";
import type { GlobalAvailableMulti } from "../../../inventory/global-available/types";

type BatchEnvelope = { ok: boolean; data: GlobalAvailableMulti[] };

export async function fetchGlobalInventoryBatch(params: {
  platform: string;
  shopId: string;
  itemIds: number[];
}): Promise<GlobalAvailableMulti[]> {
  const p = (params.platform ?? "").trim().toUpperCase();
  const s = (params.shopId ?? "").trim();

  const resp = await apiPost<BatchEnvelope>(
    `/global-available/${encodeURIComponent(p)}/${encodeURIComponent(s)}/items`,
    { item_ids: params.itemIds },
  );

  return assertOk(resp, "POST /global-available/items (compat: /global-available/{platform}/{shop_id}/items)");
}
