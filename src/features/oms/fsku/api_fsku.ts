// src/features/oms/fsku/api_fsku.ts
// FSKU 主数据已迁移到 PMS：本文件仅保留 OMS 映射页读取 PMS FSKU 列表的 adapter。
import type { Fsku, FskuComponent } from "./types";
import { apiFetchJson } from "./http";
import { asInt, asStr, asStrOrNull, isObject, kindOf } from "./api_utils";

function asShape(v: unknown): "single" | "bundle" | null {
  return v === "single" || v === "bundle" ? v : null;
}

function asStatus(v: unknown): "draft" | "published" | "retired" | null {
  return v === "draft" || v === "published" || v === "retired" ? v : null;
}

function parseFskuRow(r: unknown, idx: number): Fsku {
  if (!isObject(r)) {
    throw new Error(`合同不匹配：/pms/fskus.items[${idx}] 为 ${kindOf(r)}，期望对象`);
  }

  const id = asInt(r.id);
  if (id == null) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].id 非法`);

  const code = asStr(r.code);
  if (!code) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].code 缺失或非法`);

  const name = asStr(r.name);
  if (!name) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].name 缺失或非法`);

  const shape = asShape(r.shape);
  if (shape == null) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].shape 非法（仅允许 single/bundle）`);

  const status = asStatus(r.status);
  if (status == null) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].status 非法（draft/published/retired）`);

  const fskuExpr = asStr((r as { fsku_expr?: unknown }).fsku_expr);
  const componentsSummary = asStr(r.components_summary) ?? fskuExpr ?? "";
  const componentsSummaryName = asStr((r as { components_summary_name?: unknown }).components_summary_name) ?? undefined;

  const publishedAt = asStrOrNull(r.published_at);
  const retiredAt = asStrOrNull(r.retired_at);

  const updatedAt = asStr(r.updated_at);
  if (!updatedAt) throw new Error(`合同不匹配：/pms/fskus.items[${idx}].updated_at 缺失或非法`);

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
  };
}

function unwrapFskusList(data: unknown): Fsku[] {
  const arr: unknown[] | null = Array.isArray(data)
    ? data
    : isObject(data) && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : null;

  if (arr == null) {
    throw new Error(`合同不匹配：GET /pms/fskus 返回 ${kindOf(data)}，期望数组或 { items: [...] }`);
  }

  return arr.map((row, idx) => parseFskuRow(row, idx));
}

function buildPmsFskusListUrl(args?: {
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  storeId?: number | null;
  limit?: number;
  offset?: number;
}): string {
  const sp = new URLSearchParams();
  if (args?.query && args.query.trim()) sp.set("query", args.query.trim());
  if (args?.status) sp.set("status", args.status);
  if (typeof args?.storeId === "number" && Number.isFinite(args.storeId) && args.storeId > 0) {
    sp.set("store_id", String(Math.trunc(args.storeId)));
  }
  if (typeof args?.limit === "number") sp.set("limit", String(args.limit));
  if (typeof args?.offset === "number") sp.set("offset", String(args.offset));
  const qs = sp.toString();
  return qs ? `/pms/fskus?${qs}` : "/pms/fskus";
}

export async function apiListFskusGlobal(args?: {
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): Promise<Fsku[]> {
  const raw = await apiFetchJson<unknown>(buildPmsFskusListUrl(args), { method: "GET" });
  return unwrapFskusList(raw);
}

export async function apiListStoreFskus(args: {
  storeId: number;
  query?: string | null;
  status?: "draft" | "published" | "retired" | null;
  limit?: number;
  offset?: number;
}): Promise<Fsku[]> {
  const raw = await apiFetchJson<unknown>(
    buildPmsFskusListUrl({
      query: args.query,
      status: args.status,
      storeId: args.storeId,
      limit: args.limit,
      offset: args.offset,
    }),
    { method: "GET" },
  );
  return unwrapFskusList(raw);
}

export async function apiListFskus(): Promise<Fsku[]> {
  return apiListFskusGlobal();
}

export async function apiPatchFskuName(id: number, name: string): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/pms/fskus/${Math.trunc(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function apiPublishFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/pms/fskus/${Math.trunc(id)}/publish`, { method: "POST" });
}

export async function apiRetireFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/pms/fskus/${Math.trunc(id)}/retire`, { method: "POST" });
}

export async function apiUnretireFsku(id: number): Promise<Fsku> {
  return apiFetchJson<Fsku>(`/pms/fskus/${Math.trunc(id)}/unretire`, { method: "POST" });
}

export async function apiCreateFskuDraft(args?: {
  name?: string;
  shape?: "single" | "bundle";
  code?: string | null;
  unit_label?: string;
}): Promise<Fsku> {
  void args;
  throw new Error("旧 OMS FSKU 创建入口已退役；请使用 PMS「FSKU 组合规则」页面。");
}

export async function apiReplaceFskuComponents(
  id: number,
  components: FskuComponent[],
): Promise<unknown> {
  void id;
  void components;
  throw new Error("旧 components 手工编辑合同已退役；PMS FSKU 只接受 fsku_expr。");
}

export async function apiGetFskuComponents(id: number): Promise<FskuComponent[]> {
  void id;
  throw new Error("旧 components 读取合同已退役；请读取 /pms/fskus 的表达式与组件摘要。");
}
