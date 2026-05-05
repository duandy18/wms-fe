import type { FskuLite, StoreLite } from "./types";
import { apiFetchJson, qs } from "./http";
import { asInt, asStr, asStrOrNull, isObject, kindOf } from "./api_utils";

export type PlatformCodeIdentityKind =
  | "merchant_code"
  | "platform_sku_id"
  | "platform_item_sku";

export type PlatformCodeMappingRow = {
  id: number;
  platform: string;
  store_code: string;
  store: StoreLite;
  identity_kind: PlatformCodeIdentityKind;
  identity_value: string;
  fsku_id: number;
  fsku: FskuLite;
  reason: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformCodeMappingList = {
  items: PlatformCodeMappingRow[];
  total: number;
  limit: number;
  offset: number;
};

function asIdentityKind(value: unknown): PlatformCodeIdentityKind | null {
  if (
    value === "merchant_code" ||
    value === "platform_sku_id" ||
    value === "platform_item_sku"
  ) {
    return value;
  }
  return null;
}

function asNonNegInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    const i = Math.trunc(v);
    return i >= 0 ? i : null;
  }
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    const i = Math.trunc(n);
    return i >= 0 ? i : null;
  }
  return null;
}

function parseStoreLite(v: unknown, ctx: string): StoreLite {
  if (!isObject(v)) throw new Error(`合同不匹配：${ctx} 为 ${kindOf(v)}，期望对象`);

  const id = asInt(v.id);
  const storeName = asStr((v as { store_name?: unknown }).store_name);

  if (id == null) throw new Error(`合同不匹配：${ctx}.id 非法`);
  if (!storeName) throw new Error(`合同不匹配：${ctx}.store_name 缺失或非法`);

  return { id, store_name: storeName };
}

function parseFskuLite(v: unknown, ctx: string): FskuLite {
  if (!isObject(v)) throw new Error(`合同不匹配：${ctx} 为 ${kindOf(v)}，期望对象`);

  const id = asInt(v.id);
  const code = asStr(v.code);
  const name = asStr(v.name);
  const status = asStr(v.status) ?? "";

  if (id == null) throw new Error(`合同不匹配：${ctx}.id 非法`);
  if (!code) throw new Error(`合同不匹配：${ctx}.code 缺失或非法`);
  if (!name) throw new Error(`合同不匹配：${ctx}.name 缺失或非法`);

  return { id, code, name, status };
}

function parsePlatformCodeMappingRow(row: unknown, idx: number): PlatformCodeMappingRow {
  if (!isObject(row)) {
    throw new Error(`合同不匹配：platform-code-mappings.items[${idx}] 为 ${kindOf(row)}，期望对象`);
  }

  const id = asInt(row.id);
  const platform = asStr(row.platform);
  const storeCode = asStr(row.store_code);
  const identityKind = asIdentityKind((row as { identity_kind?: unknown }).identity_kind);
  const identityValue = asStr((row as { identity_value?: unknown }).identity_value);
  const fskuId = asInt(row.fsku_id);
  const createdAt = asStr(row.created_at);
  const updatedAt = asStr(row.updated_at);

  if (id == null) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].id 非法`);
  if (!platform) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].platform 缺失或非法`);
  if (!storeCode) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].store_code 缺失或非法`);
  if (!identityKind) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].identity_kind 非法`);
  if (!identityValue) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].identity_value 缺失或非法`);
  if (fskuId == null) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].fsku_id 非法`);
  if (!createdAt) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].created_at 缺失或非法`);
  if (!updatedAt) throw new Error(`合同不匹配：platform-code-mappings.items[${idx}].updated_at 缺失或非法`);

  return {
    id,
    platform,
    store_code: storeCode,
    store: parseStoreLite((row as { store?: unknown }).store, `platform-code-mappings.items[${idx}].store`),
    identity_kind: identityKind,
    identity_value: identityValue,
    fsku_id: fskuId,
    fsku: parseFskuLite((row as { fsku?: unknown }).fsku, `platform-code-mappings.items[${idx}].fsku`),
    reason: (row as { reason?: unknown }).reason === null
      ? null
      : (asStrOrNull((row as { reason?: unknown }).reason) ?? null),
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function unwrapList(raw: unknown): PlatformCodeMappingList {
  if (!isObject(raw)) {
    throw new Error(`合同不匹配：GET /oms/platform-code-mappings 返回 ${kindOf(raw)}，期望对象`);
  }

  if ((raw as { ok?: unknown }).ok !== true) {
    throw new Error("合同不匹配：GET /oms/platform-code-mappings.ok 非 true");
  }

  const data = (raw as { data?: unknown }).data;
  if (!isObject(data)) {
    throw new Error(`合同不匹配：GET /oms/platform-code-mappings.data 为 ${kindOf(data)}，期望对象`);
  }

  const itemsRaw = (data as { items?: unknown }).items;
  if (!Array.isArray(itemsRaw)) {
    throw new Error(`合同不匹配：GET /oms/platform-code-mappings.data.items 为 ${kindOf(itemsRaw)}，期望数组`);
  }

  const total = asNonNegInt((data as { total?: unknown }).total);
  const limit = asNonNegInt((data as { limit?: unknown }).limit);
  const offset = asNonNegInt((data as { offset?: unknown }).offset);

  if (total == null) throw new Error("合同不匹配：GET /oms/platform-code-mappings.data.total 非法");
  if (limit == null || limit < 1) throw new Error("合同不匹配：GET /oms/platform-code-mappings.data.limit 非法");
  if (offset == null) throw new Error("合同不匹配：GET /oms/platform-code-mappings.data.offset 非法");

  return {
    items: itemsRaw.map((row, idx) => parsePlatformCodeMappingRow(row, idx)),
    total,
    limit,
    offset,
  };
}

function unwrapRow(raw: unknown, endpoint: string): PlatformCodeMappingRow {
  if (!isObject(raw)) throw new Error(`合同不匹配：${endpoint} 返回 ${kindOf(raw)}，期望对象`);
  if ((raw as { ok?: unknown }).ok !== true) throw new Error(`合同不匹配：${endpoint}.ok 非 true`);

  return parsePlatformCodeMappingRow((raw as { data?: unknown }).data, 0);
}

export async function apiListPlatformCodeMappings(args: {
  platform?: string;
  store_code?: string;
  identity_kind?: PlatformCodeIdentityKind;
  identity_value?: string;
  fsku_id?: number;
  fsku_code?: string;
  limit?: number;
  offset?: number;
}): Promise<PlatformCodeMappingList> {
  const query = qs({
    platform: args.platform,
    store_code: args.store_code,
    identity_kind: args.identity_kind,
    identity_value: args.identity_value,
    fsku_id: args.fsku_id,
    fsku_code: args.fsku_code,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });

  const raw = await apiFetchJson<unknown>(`/oms/platform-code-mappings${query}`, {
    method: "GET",
  });

  return unwrapList(raw);
}

export async function apiBindPlatformCodeMapping(args: {
  platform: string;
  store_code: string;
  identity_kind: PlatformCodeIdentityKind;
  identity_value: string;
  fsku_id: number;
  reason?: string;
}): Promise<PlatformCodeMappingRow> {
  const raw = await apiFetchJson<unknown>("/oms/platform-code-mappings/bind", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      store_code: args.store_code,
      identity_kind: args.identity_kind,
      identity_value: args.identity_value,
      fsku_id: args.fsku_id,
      reason: args.reason ?? null,
    }),
  });

  return unwrapRow(raw, "POST /oms/platform-code-mappings/bind");
}

export async function apiDeletePlatformCodeMapping(args: {
  platform: string;
  store_code: string;
  identity_kind: PlatformCodeIdentityKind;
  identity_value: string;
}): Promise<PlatformCodeMappingRow> {
  const raw = await apiFetchJson<unknown>("/oms/platform-code-mappings/delete", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      store_code: args.store_code,
      identity_kind: args.identity_kind,
      identity_value: args.identity_value,
    }),
  });

  return unwrapRow(raw, "POST /oms/platform-code-mappings/delete");
}
