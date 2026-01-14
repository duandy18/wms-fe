// src/master-data/itemsApi.ts
import { apiGet } from "../lib/api";
import { fetchBarcodesByItems, type ItemBarcode } from "./itemBarcodesApi";

export interface ItemBasic {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  uom: string | null;
  enabled: boolean;

  // ⭐
  spec_family: string | null;

  // ✅ 品牌 / 分类（展示用）
  brand_name: string | null;
  category_name: string | null;

  // ✅ 条码（展示用：主条码）
  barcode: string | null;
}

type ItemsApiRow = {
  id: number;
  sku?: string | null;
  name?: string | null;
  spec?: string | null;
  spec_text?: string | null;
  uom?: string | null;
  base_uom?: string | null;
  enabled?: boolean;
  spec_family?: string | null;

  // ✅ 你的后端真实字段：brand/category/barcode（字符串或 null）
  brand?: string | null;
  category?: string | null;
  barcode?: string | null;

  // ✅ 兼容其它可能形态（保留，不影响）
  brand_name?: string | null;
  category_name?: string | null;
};

function cleanStr(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function buildPrimaryBarcodeMap(all: ItemBarcode[]): Record<number, string> {
  const m: Record<number, string> = {};
  for (const b of all) {
    const itemId = Number((b as unknown as { item_id?: unknown }).item_id);
    if (!Number.isFinite(itemId) || itemId <= 0) continue;

    const code = cleanStr((b as unknown as { barcode?: unknown }).barcode);
    if (!code) continue;

    if (!m[itemId]) m[itemId] = code;
  }
  return m;
}

export type FetchItemsBasicParams = {
  /**
   * 供应商约束（采购单创建用）
   * - 约定传给后端 query: supplier_id
   * - 若后端暂未支持，该参数会被忽略（测试会暴露，我们再补后端）
   */
  supplierId?: number | null;

  /**
   * 只取启用商品（可选）
   * - 约定传给后端 query: enabled=true
   */
  enabledOnly?: boolean;
};

export async function fetchItemsBasic(params: FetchItemsBasicParams = {}): Promise<ItemBasic[]> {
  const qs = new URLSearchParams();

  if (params.supplierId != null && Number.isFinite(params.supplierId) && params.supplierId > 0) {
    qs.set("supplier_id", String(params.supplierId));
  }
  if (params.enabledOnly) {
    qs.set("enabled", "true");
  }

  const path = qs.toString() ? `/items?${qs.toString()}` : "/items";
  const raw = await apiGet<unknown>(path);
  if (!Array.isArray(raw)) return [];

  const base: ItemBasic[] = raw.map((row) => {
    const it = row as ItemsApiRow;

    const spec = it.spec ?? it.spec_text ?? null;
    const uom = it.uom ?? it.base_uom ?? null;

    const brandName = cleanStr(it.brand_name) ?? cleanStr(it.brand) ?? null;
    const categoryName = cleanStr(it.category_name) ?? cleanStr(it.category) ?? null;

    const barcode = cleanStr(it.barcode) ?? null;

    return {
      id: Number(it.id),
      sku: String(it.sku ?? ""),
      name: String(it.name ?? ""),
      spec,
      uom,
      enabled: typeof it.enabled === "boolean" ? it.enabled : true,
      spec_family: it.spec_family ?? null,

      brand_name: brandName,
      category_name: categoryName,
      barcode,
    };
  });

  // ✅ 批量补齐主条码（避免 N+1）：复用现成的 /item-barcodes/by-items
  // 规则：仅在 base.barcode 为空时才补齐（不覆盖后端已带的值）
  const itemIds = base.map((x) => x.id).filter((x) => Number.isFinite(x) && x > 0);
  if (itemIds.length === 0) return base;

  try {
    const all = await fetchBarcodesByItems(itemIds, true);
    const map = buildPrimaryBarcodeMap(all);

    return base.map((x) => {
      if (x.barcode && x.barcode.trim()) return x;
      const bc = map[x.id];
      return bc ? { ...x, barcode: bc } : x;
    });
  } catch (err) {
    // 条码补齐失败不应阻断采购单录入；保持 base 返回即可
    console.error("fetchBarcodesByItems failed:", err);
    return base;
  }
}
