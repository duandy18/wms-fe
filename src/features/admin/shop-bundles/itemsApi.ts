// admin/shop-bundles/itemsApi.ts
import { apiFetchJson, qs } from "./http";
import type { MasterItem } from "./types";

function kindOf(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

type RawItem = {
  id: number | string;

  sku?: string | null;
  name?: string | null;

  barcode?: string | null;
  brand?: string | null;
  uom?: string | null;
};

function toStrOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

export async function apiListItems(args: { limit: number; offset: number }): Promise<MasterItem[]> {
  const url = `/items${qs({ limit: args.limit, offset: args.offset })}`;
  const data = await apiFetchJson<unknown>(url, { method: "GET" });

  // ✅ 刚性合同：必须是数组，不允许静默降级
  if (!Array.isArray(data)) {
    throw new Error(`合同不匹配：GET /items 返回 ${kindOf(data)}，期望 Item[]`);
  }

  const out: MasterItem[] = [];

  for (const x of data) {
    const r = x as RawItem;

    const idNum = typeof r.id === "number" ? r.id : Number(r.id);
    if (!Number.isFinite(idNum) || idNum <= 0) {
      throw new Error(`合同不匹配：GET /items[].id 非法（${String((r as { id?: unknown }).id)}）`);
    }

    const sku = toStrOrNull(r.sku);
    const name = toStrOrNull(r.name);

    // ✅ 刚性：sku / name 必须存在且为 string
    if (sku == null || sku === "") {
      throw new Error(`合同不匹配：GET /items[].sku 缺失或非法（item_id=${Math.trunc(idNum)}）`);
    }
    if (name == null || name === "") {
      throw new Error(`合同不匹配：GET /items[].name 缺失或非法（item_id=${Math.trunc(idNum)}）`);
    }

    const barcode = toStrOrNull(r.barcode);
    const brand = toStrOrNull(r.brand);
    const uom = toStrOrNull(r.uom);

    out.push({
      id: Math.trunc(idNum),
      sku,
      name,
      barcode,
      brand,
      uom,
    });
  }

  return out;
}
