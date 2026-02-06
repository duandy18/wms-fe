// src/features/system/shop-bundles/api.ts
import type { Fsku, FskuComponent, Platform, PlatformMirror, PlatformSkuBinding } from "./types";
import { apiFetchJson, qs } from "./http";

function kindOf(x: unknown): string {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

function asInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    const i = Math.trunc(v);
    return i > 0 ? i : null;
  }
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i > 0 ? i : null;
  }
  return null;
}

function asRole(v: unknown): "primary" | "gift" | null {
  return v === "primary" || v === "gift" ? v : null;
}

// -------- FSKU --------

export async function apiListFskus(): Promise<Fsku[]> {
  // 注意：如果后端返回分页 envelope（items/total/...），这里就不该用 Fsku[]。
  // 目前此函数不在关键路径上；如要使用，建议按合同改成返回 envelope 并刚性解包。
  return apiFetchJson<Fsku[]>("/fskus", { method: "GET" });
}

export async function apiCreateFskuDraft(args: { name: string; unit_label: string }): Promise<Fsku> {
  // ✅ 合同：POST /fskus -> 201 + json
  return apiFetchJson<Fsku>("/fskus", {
    method: "POST",
    body: JSON.stringify({ name: args.name, unit_label: args.unit_label }),
  });
}

export async function apiPublishFsku(id: number): Promise<Fsku> {
  // ✅ 合同：200 + json(status=published)
  return apiFetchJson<Fsku>(`/fskus/${id}/publish`, { method: "POST" });
}

export async function apiRetireFsku(id: number): Promise<Fsku> {
  // 合同未在你贴的片段里展示返回形状；先按常见“200 + json”写（不行会直接吐 Problem.message）
  return apiFetchJson<Fsku>(`/fskus/${id}/retire`, { method: "POST" });
}

// ✅ components 写接口：POST /fskus/{id}/components
export async function apiReplaceFskuComponents(id: number, components: FskuComponent[]): Promise<unknown> {
  // 合同：200 + json（具体返回未在测试里断言 shape，因此用 unknown）
  return apiFetchJson<unknown>(`/fskus/${id}/components`, {
    method: "POST",
    body: JSON.stringify({ components }),
  });
}

type FskuComponentsReadResp = { components: FskuComponent[] };

export async function apiGetFskuComponents(id: number): Promise<FskuComponent[]> {
  // ✅ 刚性合同：GET /fskus/{id}/components 返回 FskuDetailOut（对象），其中 components 是数组
  const data = await apiFetchJson<unknown>(`/fskus/${id}/components`, { method: "GET" });

  if (typeof data !== "object" || data === null) {
    throw new Error(`合同不匹配：GET /fskus/${id}/components 返回 ${kindOf(data)}，期望对象 { components: [...] }`);
  }

  const compsUnknown = (data as FskuComponentsReadResp).components;
  if (!Array.isArray(compsUnknown)) {
    throw new Error(
      `合同不匹配：GET /fskus/${id}/components.components 返回 ${kindOf(compsUnknown)}，期望 components: []`,
    );
  }

  // ✅ 轻量校验每个 component（避免把对象当数组再炸一次）
  const out: FskuComponent[] = [];
  for (let i = 0; i < compsUnknown.length; i += 1) {
    const c = compsUnknown[i] as unknown;

    if (typeof c !== "object" || c === null) {
      throw new Error(`合同不匹配：components[${i}] 返回 ${kindOf(c)}，期望对象`);
    }

    const itemId = asInt((c as { item_id?: unknown }).item_id);
    const qty = asInt((c as { qty?: unknown }).qty);
    const role = asRole((c as { role?: unknown }).role);

    if (itemId == null) {
      throw new Error(`合同不匹配：components[${i}].item_id 非法`);
    }
    if (qty == null) {
      throw new Error(`合同不匹配：components[${i}].qty 非法（必须为正整数）`);
    }
    if (role == null) {
      throw new Error(`合同不匹配：components[${i}].role 非法（仅允许 primary/gift）`);
    }

    out.push({ item_id: itemId, qty, role });
  }

  return out;
}

// -------- Platform mirror --------

export async function apiFetchPlatformMirror(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
}): Promise<PlatformMirror> {
  return apiFetchJson<PlatformMirror>("/platform-skus/mirror", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

// -------- Bindings --------

type CurrentBindingResp = { current: PlatformSkuBinding | null };

export async function apiGetCurrentBinding(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
}): Promise<PlatformSkuBinding | null> {
  // ✅ 合同：GET /current -> { current: {...} }
  const res = await apiFetchJson<CurrentBindingResp>(`/platform-sku-bindings/current${qs(args)}`, { method: "GET" });
  return res.current ?? null;
}

type HistoryResp = { items: PlatformSkuBinding[] };

export async function apiGetBindingHistory(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  limit?: number;
  offset?: number;
}): Promise<PlatformSkuBinding[]> {
  // ✅ 合同：GET /history -> { items:[...] }，并支持 limit/offset
  const q = qs({
    platform: args.platform,
    shop_id: args.shop_id,
    platform_sku_id: args.platform_sku_id,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });
  const res = await apiFetchJson<HistoryResp>(`/platform-sku-bindings/history${q}`, { method: "GET" });
  return res.items ?? [];
}

export async function apiUpsertBinding(args: {
  platform: Platform;
  shop_id: number;
  platform_sku_id: string;
  fsku_id: number;
  reason: string;
}): Promise<unknown> {
  // ✅ 合同：POST /platform-sku-bindings -> 201（测试断言 status_code=201，但未断言 body）
  return apiFetchJson<unknown>("/platform-sku-bindings", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      shop_id: args.shop_id,
      platform_sku_id: args.platform_sku_id,
      fsku_id: args.fsku_id,
      reason: args.reason,
    }),
  });
}
