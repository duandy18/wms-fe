// src/features/tms/pricing/hooks/usePricingPage.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  bindPricing,
  fetchPricingList,
  fetchPricingProviderOptions,
  setPricingBindingActive,
  type PricingProviderOption,
} from "../api";
import type {
  PricingFiltersState,
  PricingListRow,
  PricingStatus,
} from "../types";

export type WarehouseOption = {
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
  { value: "binding_disabled", label: "关系停用" },
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

export function usePricingPage() {
  const [rows, setRows] = useState<PricingListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState("");
  const [providerOptions, setProviderOptions] = useState<PricingProviderOption[]>([]);

  const [filters, setFilters] = useState<PricingFiltersState>(DEFAULT_FILTERS);

  // ===== 绑定仓库卡 =====
  const [bindProviderId, setBindProviderId] = useState("");
  const [bindWarehouseId, setBindWarehouseId] = useState("");
  const [bindActive, setBindActive] = useState(true);
  const [bindingSubmitting, setBindingSubmitting] = useState(false);
  const [bindingError, setBindingError] = useState("");
  const [bindingOk, setBindingOk] = useState("");

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

  const reloadProviders = useCallback(async (): Promise<void> => {
    setProvidersLoading(true);
    setProvidersError("");

    try {
      const list = await fetchPricingProviderOptions();
      setProviderOptions(list);
    } catch (err) {
      setProviderOptions([]);
      setProvidersError(
        err instanceof Error ? err.message : "加载快递网点选项失败",
      );
    } finally {
      setProvidersLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    void reloadProviders();
  }, [reload, reloadProviders]);

  const bindRow = useCallback(
    async (row: PricingListRow) => {
      await bindPricing(row.provider_id, row.warehouse_id);
      await reload();
    },
    [reload],
  );

  const toggleBinding = useCallback(
    async (row: PricingListRow) => {
      await setPricingBindingActive(
        row.provider_id,
        row.warehouse_id,
        !row.binding_active,
      );
      await reload();
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

  useEffect(() => {
    setBindingError("");
    setBindingOk("");
  }, [bindProviderId, bindWarehouseId, bindActive]);

  const submitBindCard = useCallback(async (): Promise<void> => {
    setBindingError("");
    setBindingOk("");

    const providerIdNum = Number(bindProviderId);
    const warehouseIdNum = Number(bindWarehouseId);

    if (!Number.isFinite(providerIdNum) || providerIdNum <= 0) {
      setBindingError("请选择快递网点");
      return;
    }

    if (!Number.isFinite(warehouseIdNum) || warehouseIdNum <= 0) {
      setBindingError("请选择仓库");
      return;
    }

    setBindingSubmitting(true);
    try {
      await bindPricing(providerIdNum, warehouseIdNum);

      if (!bindActive) {
        await setPricingBindingActive(providerIdNum, warehouseIdNum, false);
      }

      await reload();
      setBindingOk("已完成仓库绑定");
    } catch (err) {
      setBindingError(err instanceof Error ? err.message : "绑定仓库失败");
    } finally {
      setBindingSubmitting(false);
    }
  }, [bindActive, bindProviderId, bindWarehouseId, reload]);

  return {
    rows: filteredRows,
    rawRows: rows,
    loading,
    error,

    providersLoading,
    providersError,
    providerOptions,

    filters,
    warehouseOptions,
    statusOptions: STATUS_OPTIONS,
    summary,

    setField,
    reset,
    reload,
    bindRow,
    toggleBinding,

    bindProviderId,
    bindWarehouseId,
    bindActive,
    bindingSubmitting,
    bindingError,
    bindingOk,
    setBindProviderId,
    setBindWarehouseId,
    setBindActive,
    submitBindCard,
  };
}
