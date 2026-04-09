// src/domains/pms/public/itemsClient.ts
import { apiGet } from "../../../lib/api";
import type { ItemBasic } from "./contracts/itemBasic";
import type { FetchItemsBasicParams } from "./contracts/itemsQuery";

type PublicItemsApiRow = {
  id: number;
  sku?: string | null;
  name?: string | null;
  spec?: string | null;

  enabled?: boolean;

  // PMS public ItemBasic（后端）当前直接返回 brand/category/primary_barcode
  brand?: string | null;
  category?: string | null;
  primary_barcode?: string | null;
};

function cleanStr(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

export async function fetchItemsBasic(
  params: FetchItemsBasicParams = {},
): Promise<ItemBasic[]> {
  const qs = new URLSearchParams();

  if (
    params.supplierId != null &&
    Number.isFinite(params.supplierId) &&
    params.supplierId > 0
  ) {
    qs.set("supplier_id", String(params.supplierId));
  }
  if (params.enabledOnly) {
    qs.set("enabled", "true");
  }

  if (params.keyword && params.keyword.trim()) {
    qs.set("q", params.keyword.trim());
  }

  if (params.limit != null && Number.isFinite(params.limit) && params.limit > 0) {
    qs.set("limit", String(params.limit));
  }

  const path = qs.toString() ? `/public/items?${qs.toString()}` : "/public/items";
  const raw = await apiGet<unknown>(path);
  if (!Array.isArray(raw)) return [];

  return raw.map((row) => {
    const it = row as PublicItemsApiRow;

    return {
      id: Number(it.id),
      sku: String(it.sku ?? ""),
      name: String(it.name ?? ""),
      spec: cleanStr(it.spec),
      uom: null,
      enabled: typeof it.enabled === "boolean" ? it.enabled : true,

      // public ItemBasic 前端合同仍保留这两个展示字段名
      spec_family: null,
      brand_name: cleanStr(it.brand),
      category_name: cleanStr(it.category),

      // 后端 public 返回 primary_barcode；前端 public 合同字段名仍为 main_barcode
      main_barcode: cleanStr(it.primary_barcode),
    };
  });
}
