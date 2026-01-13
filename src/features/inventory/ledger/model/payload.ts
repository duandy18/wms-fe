// src/features/inventory/ledger/model/payload.ts
import type { LedgerQueryPayload } from "../api";
import { parsePositiveInt } from "../utils";

export type LedgerFormState = {
  itemId: string;
  itemKeyword: string;
  warehouseId: string;
  batchCode: string;

  reason: string;
  reasonCanon: string;
  subReason: string;

  ref: string;
  traceId: string;

  timeFrom: string;
  timeTo: string;
};

export function hasAnchorFromForm(s: LedgerFormState): boolean {
  const iid = parsePositiveInt(s.itemId);
  return Boolean(
    s.traceId.trim() ||
      s.ref.trim() ||
      iid ||
      s.reasonCanon.trim() ||
      s.subReason.trim(),
  );
}

export function buildPayload(
  s: LedgerFormState,
  opts: { limit: number; offset: number; forceTimeFrom?: boolean },
): LedgerQueryPayload {
  const payload: LedgerQueryPayload = {
    limit: opts.limit,
    offset: opts.offset,
  };

  const iid = parsePositiveInt(s.itemId);
  const wid = parsePositiveInt(s.warehouseId);

  if (iid) payload.item_id = iid;
  else if (s.itemKeyword.trim()) payload.item_keyword = s.itemKeyword.trim();

  if (wid) payload.warehouse_id = wid;
  if (s.batchCode.trim()) payload.batch_code = s.batchCode.trim();

  if (s.reason.trim()) payload.reason = s.reason.trim();
  if (s.reasonCanon.trim()) payload.reason_canon = s.reasonCanon.trim();
  if (s.subReason.trim()) payload.sub_reason = s.subReason.trim();

  if (s.ref.trim()) payload.ref = s.ref.trim();
  if (s.traceId.trim()) payload.trace_id = s.traceId.trim();

  if (s.timeFrom.trim() || opts.forceTimeFrom) payload.time_from = s.timeFrom.trim();
  if (s.timeTo.trim()) payload.time_to = s.timeTo.trim();

  return payload;
}
