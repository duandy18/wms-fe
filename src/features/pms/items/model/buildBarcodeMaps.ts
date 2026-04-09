// src/features/pms/items/store/buildBarcodeMaps.ts

import type { Item } from "../../../../contracts/item/contract";
import type { ItemBarcode } from "../api/itemBarcodesOwnerApi";
import { fetchBarcodesByItems } from "../api/itemBarcodesOwnerApi";

/**
 * 说明：
 * - 使用后端批量接口 /item-barcodes/by-items，一次请求拿到所有条码
 * - 返回扁平数组，前端按 item_id 分组生成 primaryBarcodes
 */
export async function buildBarcodeMaps(items: Item[]): Promise<{
  primaryBarcodes: Record<number, string>;
}> {
  const itemIds = items
    .map((it) => it.id)
    .filter((x) => Number.isFinite(x) && x > 0);

  const primaryMap: Record<number, string> = {};

  if (itemIds.length === 0) {
    return {
      primaryBarcodes: {},
    };
  }

  const all: ItemBarcode[] = await fetchBarcodesByItems(itemIds, true);

  for (const b of all) {
    if (!b.is_primary) continue;

    const itemId = Number(b.item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;

    const code = String(b.barcode ?? "").trim();
    if (!code) continue;

    if (primaryMap[itemId]) continue;
    primaryMap[itemId] = code;
  }

  return {
    primaryBarcodes: primaryMap,
  };
}
