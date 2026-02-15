// admin/shop-bundles/api_fsku.ts
import type { Fsku, FskuComponent } from "./types";
import { apiFetchJson } from "./http";
import { asInt, asStr, asStrOrNull, isObject, kindOf } from "./api_utils";

function asRole(v: unknown): "primary" | "gift" | null {
  return v === "primary" || v === "gift" ? v : null;
}

function asShape(v: unknown): "single" | "bundle" | null {
  return v === "single" || v === "bundle" ? v : null;
}

function asStatus(v: unknown): "draft" | "published" | "retired" | null {
  return v === "draft" || v === "published" || v === "retired" ? v : null;
}

function parseFskuRow(r: unknown, idx: number): Fsku {
  if (!isObject(r)) {
    throw new Error(`合同不匹配：/fskus.items[${idx}] 为 ${kindOf(r)}，期望对象`);
  }

  const id = asInt(r.id);
  if (id == null) throw new Error(`合同不匹配：/fskus.items[${idx}].id 非法`);

  const code = asStr(r.code);
  if (!code) throw new Error(`合同不匹配：/fskus.items[${idx}].code 缺失或非法`);

  const name = asStr(r.name);
  if (!name) throw new Error(`合同不匹配：/fskus.items[${idx}].name 缺失或非法`);

  const shape = asShape(r.shape);
  if (shape == null) throw new Error(`合同不匹配：/fskus.items[${idx}].shape 非法（仅允许 single/bundle）`);

  const status = asStatus(r.status);
  if (status == null) throw new Error(`合同不匹配：/fskus.items[${idx}].status 非法（draft/published/retired）`);

  const componentsSummary = asStr(r.components_summary);
  if (componentsSummary == null) throw new Error(`合同不匹配：/fskus.items[${idx}].components_summary 缺失或非法`);

  const componentsSummaryName = asStr((r as { components_summary_name?: unknown }).components_summary_name) ?? undefined;

  const publishedAt = asStrOrNull(r.published_at);
  const retiredAt = asStrOrNull(r.retired_at);

  const updatedAt = asStr(r.updated_at);
  if (!updatedAt) throw new Error(`合同不匹配：/fskus.items[${idx}].updated_at 缺失或非法`);

  const unitLabel = asStr((r as { unit_label?: unknown }).unit_label) ?? undefined;

  return {
    id,
    code,
    name,
    shape,
    status,
    components_summary: componentsSummary,
    components_summary_name: componentsSummaryName,
    published_at: publishedAt,
    retired_at: retiredAt,
    updated_at: updatedAt,
    unit_label: unitLabel,
  };
}

function unwrapFskusList(data: unknown): Fsku[] {
  const arr: unknown[] | null = Array.isArray(data)
    ? data
    : isObject(data) && Array.isArray((data as { items?: unknown }).items)
      ? ((data as { items: unknown[] }).items as unknown[])
      : null;

  if (arr == null) {
    throw new Error(`合同不匹配：GET /fskus 返回 ${kindOf(data)}，期望数组或 { items: [...] }`);
  }

  const out: Fsku[] = [];
  for (let i = 0; i < arr.length; i += 1) {
    out.push(parseFskuRow(arr[i], i));
  }
  return out;
}

function buildGlobalFskusListUrl(args?: {
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): string {
  const sp = new URLSearchParams();
  if (args?.query && args.query.trim()) sp.set("query", args.query.trim());
  if (args?.status) sp.set("status", args.status);
  if (typeof args?.limit === "number") sp.set("limit", String(args.limit));
  if (typeof args?.offset === "number") sp.set("offset", String(args.offset));
  const qs = sp.toString();
  return qs ? `/fskus?${qs}` : "/fskus";
}

function buildStoreFskusListUrl(args: {
  storeId: number;
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): string {
  const sid = Math.trunc(args.storeId);
  if (!Number.isFinite(sid) || sid <= 0) {
    throw new Error("storeId 非法：apiListStoreFskus 需要有效 storeId");
  }
  const sp = new URLSearchParams();
  if (args.query && args.query.trim()) sp.set("query", args.query.trim());
  if (args.status) sp.set("status", args.status);
  if (typeof args.limit === "number") sp.set("limit", String(args.limit));
  if (typeof args.offset === "number") sp.set("offset", String(args.offset));
  const qs = sp.toString();
  return qs ? `/stores/${sid}/fskus?${qs}` : `/stores/${sid}/fskus`;
}

// -------- FSKU（终态 C：两类数据源，严禁混用） --------

export async function apiListFskusGlobal(args?: {
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): Promise<Fsku[]> {
  const url = buildGlobalFskusListUrl(args);
  const raw = await apiFetchJson<unknown>(url, { method: "GET" });
  return unwrapFskusList(raw);
}

export async function apiListStoreFskus(args: {
  storeId: number;
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): Promise<Fsku[]> {
  const url = buildStoreFskusListUrl(args);
  const raw = await apiFetchJson<unknown>(url, { method: "GET" });
  return unwrapFskusList(raw);
}

// Deprecated：历史兼容（后续可删除）
export async function apiListFskus(): Promise<Fsku[]> {
  return apiListFskusGlobal();
}

export async function apiCreateFskuDraft(args: { name: string; unit_label: string }): Promise<Fsku> {
  return apiFetchJson<Fsku>("/fskus", {
    method: "POST",
    body: JSON.stringify({ name: args.name, unit_label: args.unit_label }),
  });
}

export async function apiPatchFskuName(id: number, name: string): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/fskus/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function apiPublishFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/fskus/${id}/publish`, { method: "POST" });
}

export async function apiRetireFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/fskus/${id}/retire`, { method: "POST" });
}

export async function apiUnretireFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/fskus/${id}/unretire`, { method: "POST" });
}

export async function apiReplaceFskuComponents(id: number, components: FskuComponent[]): Promise<unknown> {
  return apiFetchJson<unknown>(`/fskus/${id}/components`, {
    method: "POST",
    body: JSON.stringify({ components }),
  });
}

type FskuComponentsReadResp = { components: FskuComponent[] };

export async function apiGetFskuComponents(id: number): Promise<FskuComponent[]> {
  const data = await apiFetchJson<unknown>(`/fskus/${id}/components`, { method: "GET" });

  if (typeof data !== "object" || data === null) {
    throw new Error(`合同不匹配：GET /fskus/${id}/components 返回 ${kindOf(data)}，期望对象 { components: [...] }`);
  }

  const compsUnknown = (data as FskuComponentsReadResp).components;
  if (!Array.isArray(compsUnknown)) {
    throw new Error(`合同不匹配：GET /fskus/${id}/components.components 返回 ${kindOf(compsUnknown)}，期望 components: []`);
  }

  const out: FskuComponent[] = [];
  for (let i = 0; i < compsUnknown.length; i += 1) {
    const c = compsUnknown[i] as unknown;

    if (typeof c !== "object" || c === null) {
      throw new Error(`合同不匹配：components[${i}] 返回 ${kindOf(c)}，期望对象`);
    }

    const itemId = asInt((c as { item_id?: unknown }).item_id);
    const qty = asInt((c as { qty?: unknown }).qty);
    const role = asRole((c as { role?: unknown }).role);

    if (itemId == null) throw new Error(`合同不匹配：components[${i}].item_id 非法`);
    if (qty == null) throw new Error(`合同不匹配：components[${i}].qty 非法（必须为正整数）`);
    if (role == null) throw new Error(`合同不匹配：components[${i}].role 非法（仅允许 primary/gift）`);

    out.push({ item_id: itemId, qty, role });
  }

  return out;
}
