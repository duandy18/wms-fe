// src/features/admin/items/store/buildBarcodeMaps.ts

import type { Item } from "../../../../contracts/item/contract";
import type { ItemBarcode } from "../../../../master-data/itemBarcodesApi";
import { fetchBarcodesByItems } from "../../../../master-data/itemBarcodesApi";

/**
 * 说明：
 * - 使用后端批量接口 /item-barcodes/by-items，一次请求拿到所有条码
 * - 返回扁平数组，前端按 item_id 分组生成 primaryBarcodes / counts / owners / index
 */
export async function buildBarcodeMaps(items: Item[]): Promise<{
  primaryBarcodes: Record<number, string>;
  barcodeCounts: Record<number, number>;
  barcodeOwners: Record<string, number[]>;
  barcodeIndex: Record<string, number>;
}> {
  const itemIds = items.map((it) => it.id).filter((x) => Number.isFinite(x) && x > 0);

  const countMap: Record<number, number> = {};
  for (const id of itemIds) countMap[id] = 0;

  const primaryMap: Record<number, string> = {};
  const ownersMap: Record<string, number[]> = {};

  if (itemIds.length === 0) {
    return {
      primaryBarcodes: {},
      barcodeCounts: {},
      barcodeOwners: {},
      barcodeIndex: {},
    };
  }

  const all: ItemBarcode[] = await fetchBarcodesByItems(itemIds, true);

  for (const b of all) {
    const itemId = Number(b.item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;

    countMap[itemId] = (countMap[itemId] ?? 0) + 1;

    const code = String(b.barcode ?? "").trim();
    if (code) {
      const arr = ownersMap[code] || (ownersMap[code] = []);
      if (!arr.includes(itemId)) arr.push(itemId);
    }
  }

  for (const b of all) {
    if (!b.is_primary) continue;
    const itemId = Number(b.item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;

    const code = String(b.barcode ?? "").trim();
    if (!code) continue;

    if (primaryMap[itemId]) continue;
    primaryMap[itemId] = code;
  }

  const idx: Record<string, number> = {};
  for (const [code, owners] of Object.entries(ownersMap)) {
    if (owners.length === 1) idx[code] = owners[0];
  }

  return {
    primaryBarcodes: primaryMap,
    barcodeCounts: countMap,
    barcodeOwners: ownersMap,
    barcodeIndex: idx,
  };
}
