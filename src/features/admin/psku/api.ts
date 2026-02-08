// src/features/admin/psku/api.ts

import { apiGet, apiPost } from "@/lib/api";
import type {
  BindingHistoryItem,
  FskuPickerOption,
  FskuRef,
  PskuListResponse,
  PskuMirror,
  PskuRow,
} from "./types";

type JsonObj = Record<string, unknown>;

function isObj(x: unknown): x is JsonObj {
  return !!x && typeof x === "object";
}

function asStr(x: unknown): string | null {
  return typeof x === "string" ? x : null;
}

function asNum(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function pickStr(o: JsonObj, keys: string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    const s = asStr(v);
    if (s != null) return s;
  }
  return null;
}

function pickNum(o: JsonObj, keys: string[]): number | null {
  for (const k of keys) {
    const v = o[k];
    const n = asNum(v);
    if (n != null) return n;
  }
  return null;
}

function normalizeFskuStatus(raw: unknown): "draft" | "published" | "archived" | "retired" {
  const s = asStr(raw);
  if (s === "draft" || s === "published" || s === "archived" || s === "retired") return s;
  return "draft";
}

function parseFskuRef(x: unknown): FskuRef | null {
  if (!isObj(x)) return null;
  const id = pickNum(x, ["id", "fsku_id", "fskuId"]);
  const code = pickStr(x, ["code", "fsku_code", "fskuCode"]);
  const name = pickStr(x, ["name", "fsku_name", "fskuName"]);
  if (id == null || code == null || name == null) return null;
  return { id, code, name, status: normalizeFskuStatus(x["status"]) };
}

function parseMirror(x: unknown): PskuMirror | null {
  if (!isObj(x)) return null;
  const platform_sku_id = pickStr(x, ["platform_sku_id", "platformSkuId", "sku_id", "skuId"]);
  if (!platform_sku_id) return null;

  return {
    platform_sku_id,
    platform_product_id: pickStr(x, ["platform_product_id", "platformProductId", "platform_product", "product_id", "productId"]),
    title: pickStr(x, ["title", "name"]),
    variant_name: pickStr(x, ["variant_name", "variantName", "variant"]),
    image_url: pickStr(x, ["image_url", "imageUrl", "img", "image"]),
    observed_at: pickStr(x, ["observed_at", "observedAt", "synced_at", "syncedAt"]),
  };
}

function parseBindingCurrent(x: unknown): { binding_id: number; fsku: FskuRef } | null {
  if (!isObj(x)) return null;

  const binding_id = pickNum(x, ["binding_id", "bindingId", "id"]);
  if (binding_id == null) return null;

  const fskuNested = parseFskuRef(x["fsku"]);
  if (fskuNested) return { binding_id, fsku: fskuNested };

  const fsku_id = pickNum(x, ["fsku_id", "fskuId"]);
  const code = pickStr(x, ["fsku_code", "fskuCode", "code"]);
  const name = pickStr(x, ["fsku_name", "fskuName", "name"]);
  if (fsku_id == null || code == null || name == null) return null;

  return {
    binding_id,
    fsku: { id: fsku_id, code, name, status: normalizeFskuStatus(x["fsku_status"] ?? x["status"]) },
  };
}

export type PlatformSkuListQuery = {
  storeId: number;       // path param
  withBinding?: 0 | 1;   // query param (default 1)
  limit?: number;
  offset?: number;
  q?: string | null;
};

export async function fetchPlatformSkus(query: PlatformSkuListQuery): Promise<PskuListResponse> {
  const with_binding: 0 | 1 = query.withBinding ?? 1;

  const raw = await apiGet<unknown>(`/stores/${query.storeId}/platform-skus`, {
    with_binding,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
    q: query.q ?? null,
  });

  // 真实 schema：PlatformSkuListOut（未知字段细节）
  // 常见结构：{ items: [...], total: n }
  let itemsRaw: unknown = raw;
  let total: number | null = null;

  if (isObj(raw)) {
    if (Array.isArray(raw["items"])) itemsRaw = raw["items"];
    total = pickNum(raw, ["total", "count"]);
    if (isObj(raw["data"])) {
      const d = raw["data"];
      if (Array.isArray(d["items"])) itemsRaw = d["items"];
      total = total ?? pickNum(d, ["total", "count"]);
    }
  }

  const arr = Array.isArray(itemsRaw) ? itemsRaw : [];
  const items: PskuRow[] = arr
    .map((x): PskuRow | null => {
      if (!isObj(x)) return null;

      const id = pickNum(x, ["id"]);
      const platform = pickStr(x, ["platform"]) ?? "";
      const store_id = pickNum(x, ["store_id", "storeId"]) ?? query.storeId;
      if (id == null || !platform) return null;

      const mirror = parseMirror(x["mirror"] ?? x);
      const mirror_freshness =
        (pickStr(x, ["mirror_freshness", "mirrorFreshness"]) as "ok" | "stale" | "missing" | null) ??
        (mirror ? "ok" : "missing");

      // with_binding=1 时大概率包含 current_binding；否则可能没有
      const binding = parseBindingCurrent(x["current_binding"] ?? x["currentBinding"]) ?? null;

      return {
        id,
        platform,
        store_id,
        store_name: pickStr(x, ["store_name", "storeName"]),
        mirror,
        mirror_freshness,
        current_binding: binding
          ? {
              binding_id: binding.binding_id,
              fsku: binding.fsku,
            }
          : null,
      };
    })
    .filter((x): x is PskuRow => x != null);

  return { items, total: total ?? items.length };
}

export async function fetchPlatformSkuMirror(args: {
  platform: string;
  shopId: number; // = store_id
  platformSkuId: string;
}): Promise<PskuMirror | null> {
  const raw = await apiGet<unknown>("/platform-skus/mirror", {
    platform: args.platform,
    shop_id: args.shopId,
    platform_sku_id: args.platformSkuId,
  });

  // schema：PlatformSkuMirrorOut（未知结构）→ 兼容 { mirror: {...} } or direct object
  if (isObj(raw) && isObj(raw["mirror"])) return parseMirror(raw["mirror"]);
  return parseMirror(raw);
}

export async function fetchBindingCurrent(args: {
  platform: string;
  shopId: number; // = store_id
  platformSkuId: string;
}): Promise<{ binding_id: number; fsku: FskuRef } | null> {
  const raw = await apiGet<unknown>("/platform-sku-bindings/current", {
    platform: args.platform,
    shop_id: args.shopId,
    platform_sku_id: args.platformSkuId,
  });

  if (isObj(raw) && isObj(raw["binding"])) return parseBindingCurrent(raw["binding"]);
  return parseBindingCurrent(raw);
}

export async function fetchBindingHistory(args: {
  platform: string;
  shopId: number; // = store_id
  platformSkuId: string;
  limit?: number;
  offset?: number;
}): Promise<BindingHistoryItem[]> {
  const raw = await apiGet<unknown>("/platform-sku-bindings/history", {
    platform: args.platform,
    shop_id: args.shopId,
    platform_sku_id: args.platformSkuId,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });

  let arr: unknown = raw;
  if (isObj(raw)) {
    if (Array.isArray(raw["items"])) arr = raw["items"];
    if (Array.isArray(raw["history"])) arr = raw["history"];
    if (isObj(raw["data"])) {
      const d = raw["data"];
      if (Array.isArray(d["items"])) arr = d["items"];
      if (Array.isArray(d["history"])) arr = d["history"];
    }
  }

  if (!Array.isArray(arr)) return [];

  return arr
    .map((x): BindingHistoryItem | null => {
      if (!isObj(x)) return null;

      const at = pickStr(x, ["at", "created_at", "createdAt", "occurred_at", "occurredAt"]) ?? "";
      if (!at) return null;

      const by = pickStr(x, ["by", "actor", "user", "updated_by", "updatedBy"]);
      const note = pickStr(x, ["note", "reason", "message"]);

      const from_fsku = parseFskuRef(x["from_fsku"] ?? x["fromFsku"]);
      const to_fsku = parseFskuRef(x["to_fsku"] ?? x["toFsku"]);

      return { at, by, note, from_fsku, to_fsku };
    })
    .filter((x): x is BindingHistoryItem => x != null);
}

export async function fetchPublishedFskus(q: string): Promise<FskuPickerOption[]> {
  // 真实路径：/fskus
  const raw = await apiGet<unknown>("/fskus", {
    q,
    status: "published",
    limit: 50,
    offset: 0,
  });

  let arr: unknown = raw;
  if (isObj(raw)) {
    if (Array.isArray(raw["items"])) arr = raw["items"];
    if (isObj(raw["data"]) && Array.isArray((raw["data"] as JsonObj)["items"])) arr = (raw["data"] as JsonObj)["items"];
  }
  if (!Array.isArray(arr)) return [];

  return arr
    .map((x): FskuPickerOption | null => {
      if (!isObj(x)) return null;
      const id = pickNum(x, ["id"]);
      const code = pickStr(x, ["code"]);
      const name = pickStr(x, ["name"]);
      if (id == null || code == null || name == null) return null;
      return { id, code, name, status: normalizeFskuStatus(x["status"]) };
    })
    .filter((x): x is FskuPickerOption => x != null);
}

export async function migrateBinding(args: { bindingId: number; toFskuId: number; note?: string }): Promise<void> {
  await apiPost(`/platform-sku-bindings/${args.bindingId}/migrate`, {
    to_fsku_id: args.toFskuId,
    note: args.note ?? null,
  });
}
