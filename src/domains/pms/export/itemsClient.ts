// src/domains/pms/export/itemsClient.ts
import { apiGet } from "../../../lib/api";
import type { ItemBasic } from "./contracts/itemBasic";
import type { FetchItemsBasicParams } from "./contracts/itemsQuery";

type PublicItemsApiRow = {
  id: number;
  sku?: string | null;
  name?: string | null;
  spec?: string | null;

  enabled?: boolean;
  supplier_id?: number | null;

  brand?: string | null;
  category?: string | null;
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

  const path = qs.toString() ? `/pms/export/items?${qs.toString()}` : "/pms/export/items";
  const raw = await apiGet<unknown>(path);
  if (!Array.isArray(raw)) return [];

  return raw.map((row) => {
    const it = row as PublicItemsApiRow;

    return {
      id: Number(it.id),
      sku: String(it.sku ?? ""),
      name: String(it.name ?? ""),
      spec: cleanStr(it.spec),
      enabled: typeof it.enabled === "boolean" ? it.enabled : true,
      supplier_id:
        typeof it.supplier_id === "number" && Number.isFinite(it.supplier_id)
          ? it.supplier_id
          : null,
      brand: cleanStr(it.brand),
      category: cleanStr(it.category),
    };
  });
}
