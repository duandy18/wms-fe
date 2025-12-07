import { apiGet } from "../lib/api";

export interface ItemBasic {
  id: number;
  sku: string;
  name: string;
  spec: string | null; // 规格，例如 1.5kg*8入
  uom: string | null;  // 最小单位，例如 PCS / 袋 / 包
  enabled: boolean;
}

/**
 * 商品主数据基础列表：
 * - 调用 /items；
 * - 兼容后端 ItemOut 的 spec / uom 字段。
 */
export async function fetchItemsBasic(): Promise<ItemBasic[]> {
  const raw = await apiGet<any[]>("/items");

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((it) => {
    const spec =
      (it.spec as string | null | undefined) ??
      (it.spec_text as string | null | undefined) ??
      null;

    const uom =
      (it.uom as string | null | undefined) ??
      (it.base_uom as string | null | undefined) ??
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
