// src/features/tms/billing/hooks/useBillingItemsPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCarrierBillItems } from "../api";
import type {
  CarrierBillBatchSummary,
  CarrierBillItem,
  CarrierBillItemsQuery,
} from "../types";

const DEFAULT_QUERY: CarrierBillItemsQuery = {
  import_batch_id: undefined,
  import_batch_no: "",
  carrier_code: "",
  tracking_no: "",
  limit: 50,
  offset: 0,
};

function toPositiveInt(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function getInitialQuery(): CarrierBillItemsQuery {
  if (typeof window === "undefined") {
    return DEFAULT_QUERY;
  }

  const params = new URLSearchParams(window.location.search);
  return {
    ...DEFAULT_QUERY,
    import_batch_id: toPositiveInt(params.get("import_batch_id")),
    import_batch_no: params.get("import_batch_no") ?? "",
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

  function focusBatch(importBatchId: number): void {
    setQuery((prev) => ({
      ...prev,
      import_batch_id: importBatchId,
      offset: 0,
    }));
  }

  function clearFocusedBatch(): void {
    setQuery((prev) => ({
      ...prev,
      import_batch_id: undefined,
      offset: 0,
    }));
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

  const batchSummaries = useMemo<CarrierBillBatchSummary[]>(() => {
    const map = new Map<number, CarrierBillBatchSummary>();

    rows.forEach((row) => {
      const existing = map.get(row.import_batch_id);
      if (existing) {
        existing.item_count += 1;
        return;
      }

      map.set(row.import_batch_id, {
        import_batch_id: row.import_batch_id,
        import_batch_no: row.import_batch_no,
        carrier_code: row.carrier_code,
        bill_month: row.bill_month,
        item_count: 1,
      });
    });

    return Array.from(map.values()).sort((a, b) => b.import_batch_id - a.import_batch_id);
  }, [rows]);

  const activeBatch = useMemo<CarrierBillBatchSummary | null>(() => {
    if (query.import_batch_id == null) {
      return null;
    }
    return (
      batchSummaries.find((item) => item.import_batch_id === query.import_batch_id) ?? null
    );
  }, [batchSummaries, query.import_batch_id]);

  return {
    query,
    rows,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    batchSummaries,
    activeBatch,
    setField,
    reset,
    setOffset,
    focusBatch,
    clearFocusedBatch,
    reload,
  };
}
