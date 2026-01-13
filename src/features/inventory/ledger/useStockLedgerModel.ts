// src/features/inventory/ledger/useStockLedgerModel.ts
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { LedgerRow } from "./types";
import { getErrorMessage } from "./utils";

import { fetchLedgerList, fetchLedgerListHistory } from "./api";
import type { LedgerQueryPayload } from "./api";

import { buildHint, hasAnyHint, HINT_QUERY_KEYS } from "./model/hint";
import { isoDaysAgo, rangeDays } from "./model/timeRange";
import { needHistoryByDays, buildHistoryHint, buildHistoryModeNote } from "./model/historyPolicy";
import { buildPayload, hasAnchorFromForm } from "./model/payload";

export function useStockLedgerModel() {
  const [sp, setSp] = useSearchParams();
  const hint = useMemo(() => buildHint(sp), [sp]);
  const hasHint = useMemo(() => hasAnyHint(hint), [hint]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [total, setTotal] = useState(0);

  const pageSize = 100;
  const [offset, setOffset] = useState(0);

  // ---- 表单状态（从 URL hint 初始化）----
  const [itemId, setItemId] = useState<string>(hint.item_id ? String(hint.item_id) : "");
  const [itemKeyword, setItemKeyword] = useState<string>(hint.item_keyword ?? "");
  const [warehouseId, setWarehouseId] = useState<string>(hint.warehouse_id ? String(hint.warehouse_id) : "");
  const [batchCode, setBatchCode] = useState<string>(hint.batch_code ?? "");

  const [reason, setReason] = useState<string>(hint.reason ?? "");
  const [reasonCanon, setReasonCanon] = useState<string>(hint.reason_canon ?? "");
  const [subReason, setSubReason] = useState<string>(hint.sub_reason ?? "");

  const [ref, setRef] = useState<string>(hint.ref ?? "");
  const [traceId, setTraceId] = useState<string>(hint.trace_id ?? "");

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
    HINT_QUERY_KEYS.forEach((k) => next.delete(k));
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
    setTimeFrom("");
    setTimeTo("");
  };

  // ------- 自动切换 query / query-history 的“前端合同” -------
  const days = useMemo(() => rangeDays(timeFrom, timeTo), [timeFrom, timeTo]);
  const needHistory = useMemo(() => needHistoryByDays(days), [days]);

  const hasAnchor = useMemo(
    () =>
      hasAnchorFromForm({
        itemId,
        itemKeyword,
        warehouseId,
        batchCode,
        reason,
        reasonCanon,
        subReason,
        ref,
        traceId,
        timeFrom,
        timeTo,
      }),
    [itemId, itemKeyword, warehouseId, batchCode, reason, reasonCanon, subReason, ref, traceId, timeFrom, timeTo],
  );

  const historyModeNote = useMemo(() => buildHistoryModeNote(needHistory), [needHistory]);

  const historyHint = useMemo(
    () => buildHistoryHint({ needHistory, days, hasAnchor, timeFrom }),
    [needHistory, days, hasAnchor, timeFrom],
  );

  async function runQuery(nextOffset = 0) {
    setLoading(true);
    setError(null);

    try {
      // ---- 前端拦截：不二次解释，文案与后端 1:1 ----
      if (needHistory && historyHint) {
        throw new Error(historyHint);
      }

      const payload: LedgerQueryPayload = buildPayload(
        {
          itemId,
          itemKeyword,
          warehouseId,
          batchCode,
          reason,
          reasonCanon,
          subReason,
          ref,
          traceId,
          timeFrom,
          timeTo,
        },
        { limit: pageSize, offset: nextOffset, forceTimeFrom: needHistory },
      );

      const data = needHistory ? await fetchLedgerListHistory(payload) : await fetchLedgerList(payload);

      setRows((data.items ?? []) as LedgerRow[]);
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

    // filters
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

    // query mode info (for UI hints)
    days,
    needHistory,
    historyModeNote,
    historyHint,

    clearForm,
    runQuery,
    applyRange,
  };
}
