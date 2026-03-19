// src/features/tms/reconciliation/hooks/useReconciliationHistoryList.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchShippingBillReconciliationHistories } from "../api";
import type {
  ShippingBillReconciliationHistoriesQuery,
  ShippingBillReconciliationHistoryRow,
  ReconciliationHistoryResultStatus,
} from "../types";

const DEFAULT_QUERY: ShippingBillReconciliationHistoriesQuery = {
  carrier_code: "",
  tracking_no: "",
  result_status: "",
  limit: 50,
  offset: 0,
};

function getInitialQuery(): ShippingBillReconciliationHistoriesQuery {
  if (typeof window === "undefined") {
    return DEFAULT_QUERY;
  }

  const params = new URLSearchParams(window.location.search);
  const resultStatus = (params.get("history_result_status") ?? "").trim();

  const normalizedResultStatus: ReconciliationHistoryResultStatus | "" =
    resultStatus === "matched" ||
    resultStatus === "approved_bill_only" ||
    resultStatus === "resolved"
      ? resultStatus
      : "";

  return {
    ...DEFAULT_QUERY,
    carrier_code: params.get("history_carrier_code") ?? "",
    tracking_no: params.get("history_tracking_no") ?? "",
    result_status: normalizedResultStatus,
  };
}

export function useReconciliationHistoryList() {
  const [query, setQuery] = useState<ShippingBillReconciliationHistoriesQuery>(getInitialQuery);
  const [rows, setRows] = useState<ShippingBillReconciliationHistoryRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof ShippingBillReconciliationHistoriesQuery>(
    key: K,
    value: ShippingBillReconciliationHistoriesQuery[K],
  ): void {
    setQuery((prev) => {
      const next = { ...prev, [key]: value };
      if (key !== "offset" && key !== "limit") {
        next.offset = 0;
      }
      if (key === "limit") {
        next.offset = 0;
      }
      return next;
    });
  }

  function reset(): void {
    setQuery(DEFAULT_QUERY);
  }

  function setOffset(offset: number): void {
    setQuery((prev) => ({ ...prev, offset: Math.max(0, offset) }));
  }

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchShippingBillReconciliationHistories(query);
      setRows(res.rows ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载对账历史表失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const currentPage = useMemo(() => {
    return Math.floor(query.offset / query.limit) + 1;
  }, [query.offset, query.limit]);

  const totalPages = useMemo(() => {
    if (total <= 0) return 0;
    return Math.ceil(total / query.limit);
  }, [total, query.limit]);

  return {
    query,
    rows,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
  };
}
