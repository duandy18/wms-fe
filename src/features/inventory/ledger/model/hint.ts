// src/features/inventory/ledger/model/hint.ts
import { cleanStr, parsePositiveInt } from "../utils";

export type Hint = {
  item_id: number | null;
  item_keyword: string | null;
  warehouse_id: number | null;
  batch_code: string | null;
  reason: string | null;
  reason_canon: string | null;
  sub_reason: string | null;
  ref: string | null;
  trace_id: string | null;
  time_from: string | null;
  time_to: string | null;
};

export const HINT_QUERY_KEYS: string[] = [
  "item_id",
  "item_keyword",
  "warehouse_id",
  "batch_code",
  "reason",
  "reason_canon",
  "sub_reason",
  "ref",
  "trace_id",
  "time_from",
  "time_to",
];

export function buildHint(sp: URLSearchParams): Hint {
  return {
    item_id: parsePositiveInt(sp.get("item_id")),
    item_keyword: cleanStr(sp.get("item_keyword")),
    warehouse_id: parsePositiveInt(sp.get("warehouse_id")),
    batch_code: cleanStr(sp.get("batch_code")),
    reason: cleanStr(sp.get("reason")),
    reason_canon: cleanStr(sp.get("reason_canon")),
    sub_reason: cleanStr(sp.get("sub_reason")),
    ref: cleanStr(sp.get("ref")),
    trace_id: cleanStr(sp.get("trace_id")),
    time_from: cleanStr(sp.get("time_from")),
    time_to: cleanStr(sp.get("time_to")),
  };
}

export function hasAnyHint(h: Hint): boolean {
  return Boolean(
    h.item_id ||
      h.item_keyword ||
      h.warehouse_id ||
      h.batch_code ||
      h.reason ||
      h.reason_canon ||
      h.sub_reason ||
      h.ref ||
      h.trace_id ||
      h.time_from ||
      h.time_to,
  );
}
