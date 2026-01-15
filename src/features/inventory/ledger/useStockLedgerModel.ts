// src/features/inventory/ledger/useStockLedgerModel.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiPost } from "../../../lib/api";
import type { LedgerListResp, LedgerRow } from "./types";
import { cleanStr, getErrorMessage, parsePositiveInt } from "./utils";

type Hint = {
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

function buildHint(sp: URLSearchParams): Hint {
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

function isoDaysAgo(days: number): string {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

function parseIsoOrNull(s: string): Date | null {
  const x = (s ?? "").trim();
  if (!x) return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
}

function rangeDays(timeFrom: string, timeTo: string): number | null {
  const a = parseIsoOrNull(timeFrom);
  if (!a) return null; // 没填就表示走后端默认 7 天
  const b = parseIsoOrNull(timeTo) ?? new Date();
  const diffMs = b.getTime() - a.getTime();
  if (diffMs < 0) return 0;
  return diffMs / (24 * 60 * 60 * 1000);
}

export function useStockLedgerModel() {
  const [sp, setSp] = useSearchParams();
  const hint = useMemo(() => buildHint(sp), [sp]);

  const hasHint = Boolean(
    hint.item_id ||
      hint.item_keyword ||
      hint.warehouse_id ||
      hint.batch_code ||
      hint.reason ||
      hint.reason_canon ||
      hint.sub_reason ||
      hint.ref ||
      hint.trace_id ||
      hint.time_from ||
      hint.time_to,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [total, setTotal] = useState(0);

  const pageSize = 100;
  const [offset, setOffset] = useState(0);

  // 普通筛选
  const [itemId, setItemId] = useState<string>(hint.item_id ? String(hint.item_id) : "");
  const [itemKeyword, setItemKeyword] = useState<string>(hint.item_keyword ?? "");
  const [warehouseId, setWarehouseId] = useState<string>(hint.warehouse_id ? String(hint.warehouse_id) : "");
  const [batchCode, setBatchCode] = useState<string>(hint.batch_code ?? "");

  // 原始 / 口径 / 具体操作
  const [reason, setReason] = useState<string>(hint.reason ?? "");
  const [reasonCanon, setReasonCanon] = useState<string>(hint.reason_canon ?? "");
  const [subReason, setSubReason] = useState<string>(hint.sub_reason ?? "");

  // 精确定位
  const [ref, setRef] = useState<string>(hint.ref ?? "");
  const [traceId, setTraceId] = useState<string>(hint.trace_id ?? "");

  // 时间（只允许高级模式改；RangeBar 也会写这里）
  const [timeFrom, setTimeFrom] = useState<string>(hint.time_from ?? "");
  const [timeTo, setTimeTo] = useState<string>(hint.time_to ?? "");

  const canPrev = offset > 0;
  const canNext = offset + pageSize < total;

  const applyHintToForm = () => {
    if (hint.item_id) setItemId(String(hint.item_id));
    if (hint.item_keyword) setItemKeyword(hint.item_keyword);
    if (hint.warehouse_id) setWarehouseId(String(hint.warehouse_id));
    if (hint.batch_code) setBatchCode(hint.batch_code);
    if (hint.reason) setReason(hint.reason);
    if (hint.reason_canon) setReasonCanon(hint.reason_canon);
    if (hint.sub_reason) setSubReason(hint.sub_reason);
    if (hint.ref) setRef(hint.ref);
    if (hint.trace_id) setTraceId(hint.trace_id);
    if (hint.time_from) setTimeFrom(hint.time_from);
    if (hint.time_to) setTimeTo(hint.time_to);
  };

  const clearUrlHint = () => {
    const next = new URLSearchParams(sp);
    [
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
    ].forEach((k) => next.delete(k));
    setSp(next);
  };

  const clearForm = () => {
    setItemId("");
    setItemKeyword("");
    setWarehouseId("");
    setBatchCode("");
    setReason("");
    setReasonCanon("");
    setSubReason("");
    setRef("");
    setTraceId("");
    // 时间不强制清空：让 RangeBar 继续掌控；用户要清就手动点“默认7天”或高级里清
    setTimeFrom("");
    setTimeTo("");
  };

  async function runQuery(nextOffset = 0) {
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        limit: pageSize,
        offset: nextOffset,
      };

      const iid = parsePositiveInt(itemId);
      const wid = parsePositiveInt(warehouseId);

      if (iid) payload.item_id = iid;
      else if (itemKeyword.trim()) payload.item_keyword = itemKeyword.trim();

      if (wid) payload.warehouse_id = wid;
      if (batchCode.trim()) payload.batch_code = batchCode.trim();

      if (reason.trim()) payload.reason = reason.trim();
      if (reasonCanon.trim()) payload.reason_canon = reasonCanon.trim();
      if (subReason.trim()) payload.sub_reason = subReason.trim();

      if (ref.trim()) payload.ref = ref.trim();
      if (traceId.trim()) payload.trace_id = traceId.trim();

      if (timeFrom.trim()) payload.time_from = timeFrom.trim();
      if (timeTo.trim()) payload.time_to = timeTo.trim();

      // --- 关键：决定走普通 query 还是 history query ---
      const days = rangeDays(timeFrom, timeTo);
      const needHistory = days != null && days > 90;

      if (needHistory) {
        const hasAnchor = Boolean(
          traceId.trim() ||
            ref.trim() ||
            iid ||
            reasonCanon.trim() ||
            subReason.trim(),
        );
        if (!hasAnchor) {
          throw new Error("查询超过 90 天时，请至少指定：trace_id / ref / 商品ID / 口径 / 具体操作（任意一项）。");
        }
      }

      const path = needHistory ? "/stock/ledger/query-history" : "/stock/ledger/query";

      const data = await apiPost<LedgerListResp>(path, payload);

      setRows(data.items ?? []);
      setTotal(Number(data.total ?? 0));
      setOffset(nextOffset);
    } catch (e) {
      setError(getErrorMessage(e) || "加载库存台账失败");
    } finally {
      setLoading(false);
    }
  }

  // 页面首次加载自动拉一屏（后端默认 7 天）
  const bootLoadedRef = useRef(false);
  useEffect(() => {
    if (bootLoadedRef.current) return;
    bootLoadedRef.current = true;
    void runQuery(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RangeBar：只会设置 <=90 的范围
  const applyRange = async (range: "7d" | "30d" | "90d") => {
    if (range === "7d") {
      setTimeFrom("");
      setTimeTo("");
      await runQuery(0);
      return;
    }
    if (range === "30d") {
      setTimeFrom(isoDaysAgo(30));
      setTimeTo("");
      await runQuery(0);
      return;
    }
    setTimeFrom(isoDaysAgo(90));
    setTimeTo("");
    await runQuery(0);
  };

  return {
    hint,
    hasHint,
    applyHintToForm,
    clearUrlHint,

    loading,
    error,
    rows,
    total,
    pageSize,
    offset,
    canPrev,
    canNext,

    itemId,
    setItemId,
    itemKeyword,
    setItemKeyword,
    warehouseId,
    setWarehouseId,
    batchCode,
    setBatchCode,

    reason,
    setReason,
    reasonCanon,
    setReasonCanon,
    subReason,
    setSubReason,

    ref,
    setRef,
    traceId,
    setTraceId,

    timeFrom,
    setTimeFrom,
    timeTo,
    setTimeTo,

    clearForm,
    runQuery,
    applyRange,
  };
}
