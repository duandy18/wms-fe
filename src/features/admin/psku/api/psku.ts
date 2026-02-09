// src/features/admin/psku/api/psku.ts

import { apiGet, apiPost } from "@/lib/api";
import type {
  BindingHistoryItem,
  FskuPickerOption,
  FskuRef,
  PskuGovernanceOut,
  PskuGovernanceRow,
  PskuListResponse,
  PskuMirror,
  PskuRow,
} from "../types";
import { asStr, isObj, pickNum, pickStr, type JsonObj } from "./_common";

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
  storeId: number;
  withBinding?: 0 | 1;
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
        (pickStr(x, ["mirror_freshness", "mirrorFreshness"]) as "ok" | "stale" | "missing" | null) ?? (mirror ? "ok" : "missing");

      const binding = parseBindingCurrent(x["current_binding"] ?? x["currentBinding"]) ?? null;

      return {
        id,
        platform,
        store_id,
        store_name: pickStr(x, ["store_name", "storeName"]),
        mirror,
        mirror_freshness,
        current_binding: binding ? { binding_id: binding.binding_id, fsku: binding.fsku } : null,
      };
    })
    .filter((x): x is PskuRow => x != null);

  return { items, total: total ?? items.length };
}

export type PskuGovernanceQuery = {
  platform?: string | null;
  storeId?: number | null;
  status?: "BOUND" | "UNBOUND" | "LEGACY_ITEM_BOUND" | null;
  action?: "OK" | "BIND_FIRST" | "MIGRATE_LEGACY" | null;
  q?: string | null;
  limit?: number;
  offset?: number;
};

export async function fetchPskuGovernance(query: PskuGovernanceQuery): Promise<PskuGovernanceOut> {
  const raw = await apiGet<unknown>("/psku-governance", {
    platform: query.platform ?? null,
    store_id: query.storeId ?? null,
    status: query.status ?? null,
    action: query.action ?? null,
    q: query.q ?? null,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
  });

  if (!isObj(raw)) {
    return { items: [], total: 0, limit: query.limit ?? 50, offset: query.offset ?? 0 };
  }

  const itemsRaw: unknown = raw["items"];
  const arr = Array.isArray(itemsRaw) ? itemsRaw : [];
  const items: PskuGovernanceRow[] = arr
    .map((x): PskuGovernanceRow | null => {
      if (!isObj(x)) return null;

      const platform = pickStr(x, ["platform"]) ?? "";
      const store_id = pickNum(x, ["store_id"]) ?? null;
      const platform_sku_id = pickStr(x, ["platform_sku_id"]) ?? "";

      if (!platform || store_id == null || !platform_sku_id) return null;

      const governanceObj = x["governance"];
      const actionHintObj = x["action_hint"];

      if (!isObj(governanceObj) || !isObj(actionHintObj)) return null;

      const status = pickStr(governanceObj, ["status"]);
      const action = pickStr(actionHintObj, ["action"]);
      const requiredRaw = actionHintObj["required"];

      if (status !== "BOUND" && status !== "UNBOUND" && status !== "LEGACY_ITEM_BOUND") return null;
      if (action !== "OK" && action !== "BIND_FIRST" && action !== "MIGRATE_LEGACY") return null;

      const required: ("fsku_id" | "binding_id" | "to_fsku_id")[] = Array.isArray(requiredRaw)
        ? requiredRaw.filter((r): r is "fsku_id" | "binding_id" | "to_fsku_id" => r === "fsku_id" || r === "binding_id" || r === "to_fsku_id")
        : [];

      const bindCtxRaw = x["bind_ctx"];
      const bind_ctx =
        isObj(bindCtxRaw) && typeof bindCtxRaw["suggest_q"] === "string" && typeof bindCtxRaw["suggest_fsku_query"] === "string"
          ? { suggest_q: String(bindCtxRaw["suggest_q"]), suggest_fsku_query: String(bindCtxRaw["suggest_fsku_query"]) }
          : null;

      const componentRaw = x["component_item_ids"];
      const component_item_ids: number[] = Array.isArray(componentRaw)
        ? componentRaw.map((n) => (typeof n === "number" ? n : null)).filter((n): n is number => n != null)
        : [];

      const mirror_freshness = pickStr(x, ["mirror_freshness"]);
      const mf: "ok" | "missing" = mirror_freshness === "missing" ? "missing" : "ok";

      return {
        platform,
        store_id,
        store_name: pickStr(x, ["store_name"]),
        platform_sku_id,
        sku_name: pickStr(x, ["sku_name"]),
        spec: pickStr(x, ["spec"]),
        mirror_freshness: mf,

        binding_id: pickNum(x, ["binding_id"]),
        fsku_id: pickNum(x, ["fsku_id"]),
        fsku_code: pickStr(x, ["fsku_code"]),
        fsku_name: pickStr(x, ["fsku_name"]),
        fsku_status: pickStr(x, ["fsku_status"]),

        governance: { status },
        action_hint: { action, required },
        bind_ctx,
        component_item_ids,
      };
    })
    .filter((x): x is PskuGovernanceRow => x != null);

  const total = pickNum(raw, ["total"]) ?? items.length;
  const limit = pickNum(raw, ["limit"]) ?? (query.limit ?? 50);
  const offset = pickNum(raw, ["offset"]) ?? (query.offset ?? 0);

  return { items, total, limit, offset };
}

export async function fetchPlatformSkuMirror(args: { platform: string; storeId: number; platformSkuId: string }): Promise<PskuMirror | null> {
  const raw = await apiGet<unknown>("/platform-skus/mirror", {
    platform: args.platform,
    store_id: args.storeId,
    platform_sku_id: args.platformSkuId,
  });

  if (isObj(raw) && isObj(raw["mirror"])) return parseMirror(raw["mirror"]);
  return parseMirror(raw);
}

export async function fetchBindingCurrent(args: {
  platform: string;
  storeId: number;
  platformSkuId: string;
}): Promise<{ binding_id: number; fsku: FskuRef } | null> {
  const raw = await apiGet<unknown>("/platform-sku-bindings/current", {
    platform: args.platform,
    store_id: args.storeId,
    platform_sku_id: args.platformSkuId,
  });

  if (isObj(raw) && isObj(raw["binding"])) return parseBindingCurrent(raw["binding"]);
  return parseBindingCurrent(raw);
}

export async function fetchBindingHistory(args: {
  platform: string;
  storeId: number;
  platformSkuId: string;
  limit?: number;
  offset?: number;
}): Promise<BindingHistoryItem[]> {
  const raw = await apiGet<unknown>("/platform-sku-bindings/history", {
    platform: args.platform,
    store_id: args.storeId,
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

/**
 * ✅ 创建首条 binding（用于 BIND_FIRST：PSKU 从未绑定过，缺少 binding_id）
 * 合同关键点：备注字段名为 reason（不是 note）。
 *
 * 这里不强依赖返回体；写入后由调用方再 fetch current/history 做事实回填。
 */
export async function createBinding(args: {
  platform: string;
  storeId: number;
  platformSkuId: string;
  fskuId: number;
  reason?: string;
}): Promise<void> {
  await apiPost("/platform-sku-bindings", {
    platform: args.platform,
    store_id: args.storeId,
    platform_sku_id: args.platformSkuId,
    fsku_id: args.fskuId,
    reason: args.reason ?? null,
  });
}

export async function migrateBinding(args: { bindingId: number; toFskuId: number; reason?: string }): Promise<void> {
  await apiPost(`/platform-sku-bindings/${args.bindingId}/migrate`, {
    to_fsku_id: args.toFskuId,
    reason: args.reason ?? null,
  });
}
