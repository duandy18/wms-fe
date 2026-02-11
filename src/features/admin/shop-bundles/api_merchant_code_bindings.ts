// admin/shop-bundles/api_merchant_code_bindings.ts
import type { MerchantCodeBindingRow, MerchantCodeBindingsList } from "./types";
import { apiFetchJson, qs } from "./http";
import { asInt, asStr, asStrOrNull, isObject, kindOf } from "./api_utils";

// -------- Merchant Code bindings (filled_code/merchant_code -> FSKU) --------
//
// current-only 模型：
// - bind = upsert 覆盖绑定
// - close = delete 解绑
// - 无 effective_from / effective_to
// - 有 created_at / updated_at

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

function parseFskuLite(v: unknown, ctx: string): { id: number; code: string; name: string; status: string } {
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

function parseStoreLite(v: unknown, ctx: string): { id: number; name: string } {
  if (!isObject(v)) throw new Error(`合同不匹配：${ctx} 为 ${kindOf(v)}，期望对象`);
  const id = asInt(v.id);
  const name = asStr(v.name);
  if (id == null) throw new Error(`合同不匹配：${ctx}.id 非法`);
  if (!name) throw new Error(`合同不匹配：${ctx}.name 缺失或非法`);
  return { id, name };
}

function parseMerchantCodeBindingRow(r: unknown, idx: number): MerchantCodeBindingRow {
  if (!isObject(r)) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}] 为 ${kindOf(r)}，期望对象`);

  const id = asInt(r.id);
  if (id == null) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].id 非法`);

  const platform = asStr(r.platform);
  if (!platform) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].platform 缺失或非法`);

  // ✅ shop_id 为 string（后端/DB TEXT）
  const shopId = asStr(r.shop_id);
  if (!shopId) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].shop_id 缺失或非法（期望 string）`);

  const store = parseStoreLite((r as { store?: unknown }).store, `merchant-code-bindings.items[${idx}].store`);

  const merchantCode = asStr(r.merchant_code);
  if (!merchantCode) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].merchant_code 缺失或非法`);

  const fskuId = asInt(r.fsku_id);
  if (fskuId == null) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].fsku_id 非法`);

  const fsku = parseFskuLite((r as { fsku?: unknown }).fsku, `merchant-code-bindings.items[${idx}].fsku`);

  const reason = (r as { reason?: unknown }).reason === null ? null : (asStrOrNull((r as { reason?: unknown }).reason) ?? null);

  const createdAt = asStr(r.created_at);
  if (!createdAt) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].created_at 缺失或非法`);

  const updatedAt = asStr(r.updated_at);
  if (!updatedAt) throw new Error(`合同不匹配：merchant-code-bindings.items[${idx}].updated_at 缺失或非法`);

  return {
    id,
    platform,
    shop_id: shopId,
    store,
    merchant_code: merchantCode,
    fsku_id: fskuId,
    fsku,
    reason,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

function unwrapMerchantCodeBindingsList(raw: unknown): MerchantCodeBindingsList {
  if (!isObject(raw)) throw new Error(`合同不匹配：GET /merchant-code-bindings 返回 ${kindOf(raw)}，期望对象`);
  const ok = (raw as { ok?: unknown }).ok;
  if (ok !== true) throw new Error(`合同不匹配：GET /merchant-code-bindings.ok 非 true`);

  const data = (raw as { data?: unknown }).data;
  if (!isObject(data)) throw new Error(`合同不匹配：GET /merchant-code-bindings.data 为 ${kindOf(data)}，期望对象`);

  const itemsU = (data as { items?: unknown }).items;
  if (!Array.isArray(itemsU)) throw new Error(`合同不匹配：GET /merchant-code-bindings.data.items 为 ${kindOf(itemsU)}，期望数组`);

  const total = asNonNegInt((data as { total?: unknown }).total);
  const limit = asNonNegInt((data as { limit?: unknown }).limit);
  const offset = asNonNegInt((data as { offset?: unknown }).offset);

  if (total == null) throw new Error(`合同不匹配：GET /merchant-code-bindings.data.total 非法`);
  if (limit == null || limit < 1) throw new Error(`合同不匹配：GET /merchant-code-bindings.data.limit 非法`);
  if (offset == null) throw new Error(`合同不匹配：GET /merchant-code-bindings.data.offset 非法`);

  const out: MerchantCodeBindingRow[] = [];
  for (let i = 0; i < itemsU.length; i += 1) out.push(parseMerchantCodeBindingRow(itemsU[i], i));

  return { items: out, total, limit, offset };
}

export async function apiListMerchantCodeBindings(args: {
  platform?: string;
  shop_id?: string;
  merchant_code?: string;
  current_only?: boolean; // current-only 模型下该参数被后端忽略；保留兼容
  fsku_id?: number;
  fsku_code?: string;
  limit?: number;
  offset?: number;
}): Promise<MerchantCodeBindingsList> {
  const q = qs({
    platform: args.platform,
    shop_id: args.shop_id,
    merchant_code: args.merchant_code,
    current_only: args.current_only ?? true,
    fsku_id: args.fsku_id,
    fsku_code: args.fsku_code,
    limit: args.limit ?? 50,
    offset: args.offset ?? 0,
  });

  const raw = await apiFetchJson<unknown>(`/merchant-code-bindings${q}`, { method: "GET" });
  return unwrapMerchantCodeBindingsList(raw);
}

export async function apiBindMerchantCode(args: {
  platform: string;
  shop_id: string;
  merchant_code: string;
  fsku_id: number;
  reason: string;
}): Promise<MerchantCodeBindingRow> {
  const raw = await apiFetchJson<unknown>("/merchant-code-bindings/bind", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      shop_id: args.shop_id,
      merchant_code: args.merchant_code,
      fsku_id: args.fsku_id,
      reason: args.reason,
    }),
  });

  if (!isObject(raw)) throw new Error(`合同不匹配：POST /merchant-code-bindings/bind 返回 ${kindOf(raw)}，期望对象`);
  const ok = (raw as { ok?: unknown }).ok;
  if (ok !== true) throw new Error(`合同不匹配：POST /merchant-code-bindings/bind.ok 非 true`);
  const data = (raw as { data?: unknown }).data;
  return parseMerchantCodeBindingRow(data, 0);
}

/**
 * ✅ current-only：解绑（delete）
 * 后端路由仍为 /merchant-code-bindings/close（语义已为 delete）
 */
export async function apiUnbindMerchantCodeBinding(args: {
  platform: string;
  shop_id: string;
  merchant_code: string;
}): Promise<MerchantCodeBindingRow> {
  const raw = await apiFetchJson<unknown>("/merchant-code-bindings/close", {
    method: "POST",
    body: JSON.stringify({
      platform: args.platform,
      shop_id: args.shop_id,
      merchant_code: args.merchant_code,
    }),
  });

  if (!isObject(raw)) throw new Error(`合同不匹配：POST /merchant-code-bindings/close 返回 ${kindOf(raw)}，期望对象`);
  const ok = (raw as { ok?: unknown }).ok;
  if (ok !== true) throw new Error(`合同不匹配：POST /merchant-code-bindings/close.ok 非 true`);
  const data = (raw as { data?: unknown }).data;
  return parseMerchantCodeBindingRow(data, 0);
}

// 兼容旧命名：close == unbind（delete）
export async function apiCloseMerchantCodeBinding(args: {
  platform: string;
  shop_id: string;
  merchant_code: string;
}): Promise<MerchantCodeBindingRow> {
  return apiUnbindMerchantCodeBinding(args);
}
