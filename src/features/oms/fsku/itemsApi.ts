// src/features/oms/fsku/itemsApi.ts
import { fetchItemsBasic } from "../../../domains/pms/export/itemsClient";
import type { ItemBasic } from "../../../domains/pms/export/contracts/itemBasic";
import type { MasterItem } from "./types";

/**
 * FSKU 侧商品选择器 adapter：
 * - 不再直接请求 /items
 * - 统一复用 PMS export read client：src/domains/pms/export/itemsClient.ts
 * - 将 ItemBasic 投影为 FSKU 选择器所需的最小结构
 */
export async function apiListItems(args: { limit: number; offset: number }): Promise<MasterItem[]> {
  const limit = Number.isFinite(args.limit) && args.limit > 0 ? Math.trunc(args.limit) : 50;

  const rows = await fetchItemsBasic({ limit });

  return rows.map((r: ItemBasic) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    brand: r.brand,
  }));
}
