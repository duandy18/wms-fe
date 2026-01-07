// src/features/admin/items/store/buildBarcodeMaps.ts

import type { Item } from "../api";
import type { ItemBarcode } from "../barcodesApi";
import { fetchBarcodesByItems } from "../barcodesApi";

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

  // 先初始化 counts（即便没有条码也给 0，避免 UI undefined）
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

  // 默认只取 active=true
  const all: ItemBarcode[] = await fetchBarcodesByItems(itemIds, true);

  // 分组 & 统计
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

  // 主条码：优先 is_primary=true；若没有，则不设置（保持 UI “—”）
  for (const b of all) {
    if (!b.is_primary) continue;
    const itemId = Number(b.item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;

    const code = String(b.barcode ?? "").trim();
    if (!code) continue;

    // 一般约束保证一个 item 只有一个主条码；这里防御一下
    if (primaryMap[itemId]) continue;
    primaryMap[itemId] = code;
  }

  // barcodeIndex：只对“唯一绑定”的条码建立反查（供扫码自动定位）
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
