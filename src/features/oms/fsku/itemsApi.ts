// src/features/oms/fsku/itemsApi.ts
import { fetchItemsBasic } from "../../../master-data/itemsApi";
import type { ItemBasic } from "../../pms/items/contracts/itemBasic";
import type { MasterItem } from "./types";

/**
 * FSKU 侧商品选择器 adapter：
 * - 不再直接请求 /items
 * - 统一复用 PMS/WMS 主数据 adapter：src/master-data/itemsApi.ts
 * - 将 ItemBasic 投影为 FSKU 选择器所需的最小结构
 */
export async function apiListItems(args: { limit: number; offset: number }): Promise<MasterItem[]> {
  const limit = Number.isFinite(args.limit) && args.limit > 0 ? Math.trunc(args.limit) : 50;

  // 当前 master-data/itemsApi 暂不支持 offset；FSKU 选择器当前也只拉第一页
  const rows = await fetchItemsBasic({ limit });

  return rows.map((r: ItemBasic) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    barcode: r.main_barcode,
    brand: r.brand_name,
    uom: r.uom,
  }));
}
