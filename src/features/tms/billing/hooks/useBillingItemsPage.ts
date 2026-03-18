// src/features/tms/billing/hooks/useBillingItemsPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCarrierBillItems } from "../api";
import type { CarrierBillItem, CarrierBillItemsQuery } from "../types";

const DEFAULT_QUERY: CarrierBillItemsQuery = {
  carrier_code: "",
  tracking_no: "",
  limit: 50,
  offset: 0,
};

function getInitialQuery(): CarrierBillItemsQuery {
  if (typeof window === "undefined") {
    return DEFAULT_QUERY;
  }

  const params = new URLSearchParams(window.location.search);
  return {
    ...DEFAULT_QUERY,
    carrier_code: params.get("carrier_code") ?? "",
    tracking_no: params.get("tracking_no") ?? "",
  };
}

export function useBillingItemsPage() {
  const [query, setQuery] = useState<CarrierBillItemsQuery>(getInitialQuery);
  const [rows, setRows] = useState<CarrierBillItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof CarrierBillItemsQuery>(
    key: K,
    value: CarrierBillItemsQuery[K],
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
      const res = await fetchCarrierBillItems(query);
      setRows(res.rows ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载快递账单失败");
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
