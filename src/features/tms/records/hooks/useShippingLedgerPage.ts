// src/features/tms/records/hooks/useShippingLedgerPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { exportShippingLedgerCsv, fetchShippingLedger } from "../api";
import type { ShippingLedgerRow } from "../types";
import { useShippingLedgerQuery } from "./useShippingLedgerQuery";

export function useShippingLedgerPage() {
  const { query, setField, reset, setOffset } = useShippingLedgerQuery();

  const [rows, setRows] = useState<ShippingLedgerRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchShippingLedger(query);
      setRows(Array.isArray(res.rows) ? res.rows : []);
      setTotal(typeof res.total === "number" ? res.total : 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "加载运输台帐失败";
      setError(message);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const exportCsv = useCallback(async (): Promise<void> => {
    setExporting(true);
    try {
      const blob = await exportShippingLedgerCsv(query);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "shipping-ledger-export.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "导出失败";
      setError(message);
    } finally {
      setExporting(false);
    }
  }, [query]);

  const currentPage = useMemo(() => {
    if (query.limit <= 0) return 1;
    return Math.floor(query.offset / query.limit) + 1;
  }, [query.limit, query.offset]);

  const totalPages = useMemo(() => {
    if (query.limit <= 0 || total <= 0) return 0;
    return Math.ceil(total / query.limit);
  }, [query.limit, total]);

  return {
    query,
    rows,
    total,
    loading,
    exporting,
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
    exportCsv,
  };
}
