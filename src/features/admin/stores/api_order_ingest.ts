// src/features/admin/stores/api_order_ingest.ts
//
// ✅ 业务域：平台订单 ingest（与 ops/dev 解耦）
// - 只暴露一个请求函数：apiIngestPlatformOrder(payload)
// - ✅ 兼容两种后端响应：
//   A) 直接返回 IngestOut（当前 /platform-orders/ingest 实际返回）
//   B) 返回 { ok, data } envelope（历史/其他路由可能使用）
// - IngestOut/Row/next_actions 对齐后端真实返回（curl 已验证）

import { apiPost } from "../../../lib/api";

// ---- Minimal helpers ----
function isObject(x: unknown): x is Record<string, unknown> {
  return Boolean(x) && typeof x === "object";
}

function asString(x: unknown): string | null {
  return typeof x === "string" ? x : null;
}

function asNumber(x: unknown): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function asBool(x: unknown): boolean | null {
  return typeof x === "boolean" ? x : null;
}

function asArray(x: unknown): unknown[] | null {
  return Array.isArray(x) ? x : null;
}

function asNullableString(x: unknown): string | null {
  if (x == null) return null;
  return asString(x);
}

function asNullableNumber(x: unknown): number | null {
  if (x == null) return null;
  return asNumber(x);
}

function asNullableStringArray(x: unknown): string[] | null {
  if (x == null) return null;
  if (!Array.isArray(x)) return null;
  const out: string[] = [];
  for (const it of x) {
    if (typeof it !== "string") return null;
    out.push(it);
  }
  return out;
}

function getErrMsg(resp: unknown, hint: string): string {
  if (isObject(resp)) {
    const msg = asString(resp.message) || asString(resp.error);
    if (msg) return msg;
    const detail = resp.detail;
    if (typeof detail === "string") return detail;
    if (detail != null) {
      try {
        return `${hint} failed: ${JSON.stringify(detail)}`;
      } catch {
        return `${hint} failed`;
      }
    }
  }
  return `${hint} failed`;
}

// ---- Contract: Request ----
export type IngestLineIn = {
  qty: number;
  filled_code: string;
  title?: string | null;
  spec?: string | null;
};

export type IngestReq = {
  platform: string;
  shop_id: string;
  ext_order_no: string;
  province: string;
  city: string;
  lines: IngestLineIn[];
};

// ---- Contract: Response ----
export type NextAction =
  | {
      action: "bind_merchant_code";
      label: string;
      endpoint: string;
      payload: {
        platform: string;
        store_id: number;
        filled_code: string;
        fsku_id: number | null;
        reason: string;
      };
    }
  | {
      action: "go_store_fsku_binding_governance";
      label: string;
      payload: {
        platform: string;
        store_id: number;
        merchant_code: string;
      };
    }
  | {
      action: string;
      label: string;
      endpoint?: string;
      payload?: Record<string, unknown>;
    };

export type ExpandedItem = {
  item_id: number;
  component_qty: number;
  need_qty: number;
  role: string;
};

export type ResolvedRow = {
  filled_code: string;
  qty: number;
  reason: string | null;
  hint: string | null;
  fsku_id: number | null;
  expanded_items: ExpandedItem[] | null;
  risk_flags: string[] | null;
  risk_level: string | null;
  risk_reason: string | null;
  next_actions: NextAction[] | null;
};

export type IngestOut = {
  status: "OK" | "UNRESOLVED" | "FULFILLMENT_BLOCKED" | string;
  id: number | null;
  ref: string;
  store_id: number | null;
  resolved: ResolvedRow[];
  unresolved: ResolvedRow[];
  facts_written: number;
  fulfillment_status: string | null;
  blocked_reasons: string[] | null;
  allow_manual_continue: boolean;
  risk_flags: string[];
  risk_level: string | null;
  risk_reason: string | null;
};

function parseExpandedItem(raw: unknown, at: string): ExpandedItem {
  if (!isObject(raw)) throw new Error(`合同不匹配：${at} 期望对象`);
  const itemId = asNumber(raw.item_id);
  const componentQty = asNumber(raw.component_qty);
  const needQty = asNumber(raw.need_qty);
  const role = asString(raw.role);
  if (itemId == null) throw new Error(`合同不匹配：${at}.item_id 非法`);
  if (componentQty == null) throw new Error(`合同不匹配：${at}.component_qty 非法`);
  if (needQty == null) throw new Error(`合同不匹配：${at}.need_qty 非法`);
  if (!role) throw new Error(`合同不匹配：${at}.role 缺失或非法`);
  return { item_id: itemId, component_qty: componentQty, need_qty: needQty, role };
}

function parseResolvedRow(raw: unknown, at: string): ResolvedRow {
  if (!isObject(raw)) throw new Error(`合同不匹配：${at} 期望对象`);
  const filledCode = asString(raw.filled_code);
  const qty = asNumber(raw.qty);
  if (!filledCode) throw new Error(`合同不匹配：${at}.filled_code 缺失或非法`);
  if (qty == null) throw new Error(`合同不匹配：${at}.qty 非法`);

  const expandedU = raw.expanded_items;
  let expanded: ExpandedItem[] | null = null;
  if (expandedU != null) {
    const arr = asArray(expandedU);
    if (!arr) throw new Error(`合同不匹配：${at}.expanded_items 非法`);
    expanded = arr.map((x, i) => parseExpandedItem(x, `${at}.expanded_items[${i}]`));
  }

  return {
    filled_code: filledCode,
    qty,
    reason: asNullableString(raw.reason),
    hint: asNullableString(raw.hint),
    fsku_id: asNullableNumber(raw.fsku_id),
    expanded_items: expanded,
    risk_flags: asNullableStringArray(raw.risk_flags),
    risk_level: asNullableString(raw.risk_level),
    risk_reason: asNullableString(raw.risk_reason),
    next_actions: asArray(raw.next_actions)?.filter(isObject) as NextAction[] | null,
  };
}

function parseIngestOut(raw: unknown, hint: string): IngestOut {
  if (isObject(raw) && typeof raw.status === "string" && typeof raw.ref === "string") {
    const resolved = (asArray(raw.resolved) ?? []).map((x, i) =>
      parseResolvedRow(x, `${hint}.resolved[${i}]`)
    );
    const unresolved = (asArray(raw.unresolved) ?? []).map((x, i) =>
      parseResolvedRow(x, `${hint}.unresolved[${i}]`)
    );

    const factsWritten = asNumber(raw.facts_written);
    const allowManual = asBool(raw.allow_manual_continue);

    if (factsWritten == null) throw new Error(`合同不匹配：${hint}.facts_written 非法`);
    if (allowManual == null) throw new Error(`合同不匹配：${hint}.allow_manual_continue 非法`);

    return {
      status: raw.status,
      id: asNullableNumber(raw.id),
      ref: raw.ref,
      store_id: asNullableNumber(raw.store_id),
      resolved,
      unresolved,
      facts_written: factsWritten,
      fulfillment_status: asNullableString(raw.fulfillment_status),
      blocked_reasons: asNullableStringArray(raw.blocked_reasons),
      allow_manual_continue: allowManual,
      risk_flags: asNullableStringArray(raw.risk_flags) ?? [],
      risk_level: asNullableString(raw.risk_level),
      risk_reason: asNullableString(raw.risk_reason),
    };
  }

  if (isObject(raw) && typeof raw.ok === "boolean") {
    if (raw.ok === true) {
      return parseIngestOut((raw as { data?: unknown }).data, hint);
    }
    throw new Error(getErrMsg(raw, hint));
  }

  throw new Error(getErrMsg(raw, hint));
}

export async function apiIngestPlatformOrder(payload: IngestReq): Promise<IngestOut> {
  const resp = await apiPost<unknown>("/platform-orders/ingest", payload);
  return parseIngestOut(resp, "POST /platform-orders/ingest");
}
