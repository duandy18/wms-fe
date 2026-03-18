// src/features/tms/reconciliation/hooks/useReconciliationList.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchShippingBillReconciliationDetail,
  fetchShippingBillReconciliations,
} from "../api";
import type {
  ShippingBillReconciliationDetailResponse,
  ShippingBillReconciliationsQuery,
  ShippingBillReconciliationRow,
} from "../types";

const DEFAULT_QUERY: ShippingBillReconciliationsQuery = {
  carrier_code: "",
  tracking_no: "",
  status: "",
  limit: 50,
  offset: 0,
};

function getInitialQuery(): ShippingBillReconciliationsQuery {
  if (typeof window === "undefined") {
    return DEFAULT_QUERY;
  }

  const params = new URLSearchParams(window.location.search);
  const status = (params.get("status") ?? "").trim();

  return {
    ...DEFAULT_QUERY,
    carrier_code: params.get("carrier_code") ?? "",
    tracking_no: params.get("tracking_no") ?? "",
    status:
      status === "diff" || status === "bill_only" || status === "record_only" ? status : "",
  };
}

export function useReconciliationList(initialCarrierCode?: string) {
  const [query, setQuery] = useState<ShippingBillReconciliationsQuery>(() => {
    const initial = getInitialQuery();
    if (initialCarrierCode && !initial.carrier_code) {
      return { ...initial, carrier_code: initialCarrierCode };
    }
    return initial;
  });

  const [rows, setRows] = useState<ShippingBillReconciliationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ShippingBillReconciliationDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  function setField<K extends keyof ShippingBillReconciliationsQuery>(
    key: K,
    value: ShippingBillReconciliationsQuery[K],
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

  function setCarrierCode(carrierCode: string): void {
    setQuery((prev) => ({
      ...prev,
      carrier_code: carrierCode,
      offset: 0,
    }));
  }

  function reset(): void {
    setQuery({
      ...DEFAULT_QUERY,
      carrier_code: initialCarrierCode ?? "",
    });
  }

  function setOffset(offset: number): void {
    setQuery((prev) => ({ ...prev, offset: Math.max(0, offset) }));
  }

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchShippingBillReconciliations(query);
      setRows(res.rows ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载对账异常列表失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadDetail = useCallback(async (reconciliationId: number): Promise<void> => {
    setSelectedId(reconciliationId);
    setDetailLoading(true);
    setDetailError("");

    try {
      const res = await fetchShippingBillReconciliationDetail(reconciliationId);
      setDetail(res);
    } catch (err) {
      setDetail(null);
      setDetailError(err instanceof Error ? err.message : "加载异常详情失败");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  function clearDetail(): void {
    setSelectedId(null);
    setDetail(null);
    setDetailError("");
    setDetailLoading(false);
  }

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
    selectedId,
    detail,
    detailLoading,
    detailError,
    setField,
    setCarrierCode,
    reset,
    setOffset,
    reload,
    loadDetail,
    clearDetail,
  };
}
