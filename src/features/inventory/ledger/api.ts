// src/features/inventory/ledger/api.ts
import { apiPost } from "../../../lib/api";
import type { LedgerListResp, LedgerRow } from "./types";

export type LedgerQueryPayload = {
  // 维度类
  item_id?: number;
  item_keyword?: string;
  warehouse_id?: number;
  batch_code?: string;

  // 行为类
  reason?: string;
  reason_canon?: string;
  sub_reason?: string;

  // 定位类
  ref?: string;
  trace_id?: string;

  // 时间类（ISO）
  time_from?: string;
  time_to?: string;

  // 分页
  limit?: number;
  offset?: number;
};

function normalizeLedgerListResp(input: unknown): LedgerListResp {
  // 兼容后端在不同分支返回：
  // 1) { total, items }
  // 2) items[]（直接数组）
  if (Array.isArray(input)) {
    return { total: input.length, items: input as LedgerRow[] };
  }
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const items = Array.isArray(obj.items) ? (obj.items as LedgerRow[]) : [];
    const total = typeof obj.total === "number" ? obj.total : items.length;
    return { total, items };
  }
  return { total: 0, items: [] };
}

export async function fetchLedgerList(payload: LedgerQueryPayload): Promise<LedgerListResp> {
  const raw = await apiPost<unknown>("/stock/ledger/query", payload);
  return normalizeLedgerListResp(raw);
}

export async function fetchLedgerListHistory(payload: LedgerQueryPayload): Promise<LedgerListResp> {
  const raw = await apiPost<unknown>("/stock/ledger/query-history", payload);
  return normalizeLedgerListResp(raw);
}
