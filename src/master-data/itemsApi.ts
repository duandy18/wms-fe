// src/master-data/itemsApi.ts
import { apiGet } from "../lib/api";

export interface ItemBasic {
  id: number;
  sku: string;
  name: string;
  spec: string | null;
  uom: string | null;
  enabled: boolean;
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
};

/**
 * 商品主数据基础列表：
 * - 调用 /items；
 * - 兼容后端 ItemOut 的 spec / uom 字段。
 */
export async function fetchItemsBasic(): Promise<ItemBasic[]> {
  const raw = await apiGet<unknown>("/items");

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((row) => {
    const it = row as ItemsApiRow;

    const spec =
      it.spec ??
      it.spec_text ??
      null;

    const uom =
      it.uom ??
      it.base_uom ??
      null;

    return {
      id: Number(it.id),
      sku: String(it.sku ?? ""),
      name: String(it.name ?? ""),
      spec,
      uom,
      enabled:
        typeof it.enabled === "boolean" ? it.enabled : true,
    };
  });
}
