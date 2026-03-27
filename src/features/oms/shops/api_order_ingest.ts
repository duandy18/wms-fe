// src/features/admin/stores/api_order_ingest.ts
//
// ✅ 业务域：平台订单 ingest + store order-sim（preview / generate）
//
// - apiIngestPlatformOrder(payload): POST /platform-orders/ingest（旧路径，保留）
// - apiOrderSimPreview(storeId, idempotency_key?): POST /stores/{id}/order-sim/preview-order（不落库）
// - apiOrderSimGenerate(storeId, idempotency_key?): POST /stores/{id}/order-sim/generate-order（落库）
//
// - ✅ 兼容两种后端响应：
//   A) 直接返回 IngestOut（当前 /platform-orders/ingest 实际返回）
//   B) 返回 { ok, data } envelope（order-sim 与部分历史路由）
//
// - IngestOut/Row/next_actions 对齐后端真实返回（curl 已验证）
// - Phase D：reason_code / next_actions（顶层）
// - order-sim preview：preview + ingest_result

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

function unwrapOkData(resp: unknown): unknown {
  if (isObject(resp) && typeof resp.ok === "boolean") {
    if (resp.ok === true) return (resp as { data?: unknown }).data;
    throw new Error(getErrMsg(resp, "request"));
  }
  return resp;
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

  // ✅ Phase D (顶层)
  platform?: string;
  shop_id?: string;
  reason_code?: string | null;
  next_actions?: Record<string, unknown>[];
  dry_run?: boolean | null;
};

export type OrderSimPreview = {
  dry_run: boolean;
  store_id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  address: Record<string, unknown> | null;
  raw_lines: Record<string, unknown>[];
};

export type OrderSimPreviewOut = {
  preview: OrderSimPreview;
  ingest_result: IngestOut;
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
    next_actions: (asArray(raw.next_actions)?.filter(isObject) as NextAction[] | null) ?? null,
  };
}

function parseIngestOut(raw: unknown, hint: string): IngestOut {
  const unwrapped = unwrapOkData(raw);

  if (isObject(unwrapped) && typeof unwrapped.status === "string" && typeof unwrapped.ref === "string") {
    const resolved = (asArray(unwrapped.resolved) ?? []).map((x, i) => parseResolvedRow(x, `${hint}.resolved[${i}]`));
    const unresolved = (asArray(unwrapped.unresolved) ?? []).map((x, i) => parseResolvedRow(x, `${hint}.unresolved[${i}]`));

    const factsWritten = asNumber(unwrapped.facts_written);
    const allowManual = asBool(unwrapped.allow_manual_continue);
    if (factsWritten == null) throw new Error(`合同不匹配：${hint}.facts_written 非法`);
    if (allowManual == null) throw new Error(`合同不匹配：${hint}.allow_manual_continue 非法`);

    return {
      status: unwrapped.status,
      id: asNullableNumber(unwrapped.id),
      ref: unwrapped.ref,
      store_id: asNullableNumber(unwrapped.store_id),
      resolved,
      unresolved,
      facts_written: factsWritten,
      fulfillment_status: asNullableString(unwrapped.fulfillment_status),
      blocked_reasons: asNullableStringArray(unwrapped.blocked_reasons),
      allow_manual_continue: allowManual,
      risk_flags: asNullableStringArray(unwrapped.risk_flags) ?? [],
      risk_level: asNullableString(unwrapped.risk_level),
      risk_reason: asNullableString(unwrapped.risk_reason),

      platform: asNullableString(unwrapped.platform) ?? undefined,
      shop_id: asNullableString(unwrapped.shop_id) ?? undefined,
      reason_code: asNullableString(unwrapped.reason_code),
      next_actions: (asArray(unwrapped.next_actions)?.filter(isObject) as Record<string, unknown>[]) ?? undefined,
      dry_run: asBool(unwrapped.dry_run),
    };
  }

  throw new Error(getErrMsg(raw, hint));
}

function parseOrderSimPreview(raw: unknown, hint: string): OrderSimPreviewOut {
  const unwrapped = unwrapOkData(raw);
  if (!isObject(unwrapped)) throw new Error(getErrMsg(raw, hint));

  const previewU = unwrapped.preview;
  const ingestU = unwrapped.ingest_result;

  if (!isObject(previewU)) throw new Error(`合同不匹配：${hint}.preview 期望对象`);
  const dryRun = asBool(previewU.dry_run);
  const storeId = asNumber(previewU.store_id);
  const platform = asString(previewU.platform);
  const shopId = asString(previewU.shop_id);
  const extOrderNo = asString(previewU.ext_order_no);

  if (dryRun == null) throw new Error(`合同不匹配：${hint}.preview.dry_run 非法`);
  if (storeId == null) throw new Error(`合同不匹配：${hint}.preview.store_id 非法`);
  if (!platform) throw new Error(`合同不匹配：${hint}.preview.platform 非法`);
  if (!shopId) throw new Error(`合同不匹配：${hint}.preview.shop_id 非法`);
  if (!extOrderNo) throw new Error(`合同不匹配：${hint}.preview.ext_order_no 非法`);

  const rawLinesArr = asArray(previewU.raw_lines) ?? [];
  const rawLines = rawLinesArr.filter(isObject) as Record<string, unknown>[];

  const preview: OrderSimPreview = {
    dry_run: dryRun,
    store_id: storeId,
    platform,
    shop_id: shopId,
    ext_order_no: extOrderNo,
    buyer_name: asNullableString(previewU.buyer_name),
    buyer_phone: asNullableString(previewU.buyer_phone),
    address: (isObject(previewU.address) ? (previewU.address as Record<string, unknown>) : null),
    raw_lines: rawLines,
  };

  const ingest_result = parseIngestOut(ingestU, `${hint}.ingest_result`);
  return { preview, ingest_result };
}

// ---- API ----
export async function apiIngestPlatformOrder(payload: IngestReq): Promise<IngestOut> {
  const resp = await apiPost<unknown>("/platform-orders/ingest", payload);
  return parseIngestOut(resp, "POST /platform-orders/ingest");
}

export async function apiOrderSimPreview(args: { storeId: number; idempotency_key?: string | null }): Promise<OrderSimPreviewOut> {
  const { storeId, idempotency_key } = args;
  const resp = await apiPost<unknown>(`/stores/${storeId}/order-sim/preview-order`, {
    idempotency_key: idempotency_key ?? null,
  });
  return parseOrderSimPreview(resp, `POST /stores/${storeId}/order-sim/preview-order`);
}

export async function apiOrderSimGenerate(args: { storeId: number; idempotency_key?: string | null }): Promise<IngestOut> {
  const { storeId, idempotency_key } = args;
  const resp = await apiPost<unknown>(`/stores/${storeId}/order-sim/generate-order`, {
    idempotency_key: idempotency_key ?? null,
  });
  return parseIngestOut(resp, `POST /stores/${storeId}/order-sim/generate-order`);
}
