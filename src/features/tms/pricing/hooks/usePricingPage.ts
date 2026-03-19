// src/features/tms/pricing/hooks/usePricingPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPricingList,
  bindPricing,
  updatePricingBinding,
} from "../api";
import { createPricingScheme } from "../../providers/api/schemes";
import type {
  PricingFiltersState,
  PricingListRow,
  PricingStatus,
} from "../types";

type WarehouseOption = {
  warehouse_id: number;
  warehouse_name: string;
};

type StatusOption = {
  value: PricingStatus;
  label: string;
};

const DEFAULT_FILTERS: PricingFiltersState = {
  keyword: "",
  warehouse_id: "",
  pricing_status: "",
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "ready", label: "已就绪" },
  { value: "no_active_scheme", label: "缺启用运价" },
  { value: "binding_disabled", label: "仓库绑定停用" },
  { value: "provider_disabled", label: "网点停用" },
];

function includesKeyword(row: PricingListRow, keyword: string): boolean {
  const text = keyword.trim().toLowerCase();
  if (!text) return true;

  return [
    row.provider_code,
    row.provider_name,
    row.warehouse_name,
    String(row.warehouse_id),
  ]
    .join(" ")
    .toLowerCase()
    .includes(text);
}

function buildDefaultSchemeName(row: PricingListRow): string {
  return `${row.provider_name}-${row.warehouse_name}-基础运价`;
}

export function usePricingPage() {
  const [rows, setRows] = useState<PricingListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<PricingFiltersState>(DEFAULT_FILTERS);

  const reload = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      const res = await fetchPricingList();
      setRows(Array.isArray(res?.rows) ? res.rows : []);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "加载运价管理列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const bindRow = useCallback(
    async (row: PricingListRow) => {
      await bindPricing(row.provider_id, row.warehouse_id);
      await reload();
    },
    [reload],
  );

  const toggleBinding = useCallback(
    async (row: PricingListRow) => {
      await updatePricingBinding(row.provider_id, row.warehouse_id, {
        active: !row.binding_active,
      });
      await reload();
    },
    [reload],
  );

  const updatePriority = useCallback(
    async (row: PricingListRow, priority: number) => {
      await updatePricingBinding(row.provider_id, row.warehouse_id, {
        priority,
      });
      await reload();
    },
    [reload],
  );

  const createSchemeRow = useCallback(
    async (row: PricingListRow) => {
      const detail = await createPricingScheme(row.provider_id, {
        warehouse_id: row.warehouse_id,
        name: buildDefaultSchemeName(row),
        currency: "CNY",
        default_pricing_mode: "linear_total",
        billable_weight_strategy: "actual_only",
        rounding_mode: "none",
      });
      await reload();
      return detail.id;
    },
    [reload],
  );

  const setField = useCallback(
    <K extends keyof PricingFiltersState>(
      key: K,
      value: PricingFiltersState[K],
    ): void => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [],
  );

  const reset = useCallback((): void => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const warehouseOptions = useMemo<WarehouseOption[]>(() => {
    const map = new Map<number, string>();

    for (const row of rows) {
      if (!map.has(row.warehouse_id)) {
        map.set(row.warehouse_id, row.warehouse_name);
      }
    }

    return Array.from(map.entries())
      .map(([warehouse_id, warehouse_name]) => ({
        warehouse_id,
        warehouse_name,
      }))
      .sort((a, b) =>
        a.warehouse_name.localeCompare(b.warehouse_name, "zh-CN"),
      );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!includesKeyword(row, filters.keyword)) return false;

      if (
        filters.warehouse_id &&
        String(row.warehouse_id) !== String(filters.warehouse_id)
      ) {
        return false;
      }

      if (
        filters.pricing_status &&
        row.pricing_status !== filters.pricing_status
      ) {
        return false;
      }

      return true;
    });
  }, [rows, filters]);

  const summary = useMemo(() => {
    const readyCount = filteredRows.filter(
      (x) => x.pricing_status === "ready",
    ).length;
    const noActiveSchemeCount = filteredRows.filter(
      (x) => x.pricing_status === "no_active_scheme",
    ).length;
    const bindingDisabledCount = filteredRows.filter(
      (x) => x.pricing_status === "binding_disabled",
    ).length;
    const providerDisabledCount = filteredRows.filter(
      (x) => x.pricing_status === "provider_disabled",
    ).length;

    return {
      total: filteredRows.length,
      readyCount,
      noActiveSchemeCount,
      bindingDisabledCount,
      providerDisabledCount,
    };
  }, [filteredRows]);

  return {
    rows: filteredRows,
    rawRows: rows,
    loading,
    error,
    filters,
    warehouseOptions,
    statusOptions: STATUS_OPTIONS,
    summary,
    setField,
    reset,
    reload,
    bindRow,
    toggleBinding,
    updatePriority,
    createSchemeRow,
  };
}
