import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchInventoryAdjustmentSummary,
  fetchInventoryAdjustmentSummaryDetail,
} from "../api/inventoryAdjustmentSummaryApi";
import type {
  InventoryAdjustmentSummaryRowOut,
  InventoryAdjustmentSummaryType,
} from "../contracts/inventoryAdjustmentSummary";
import { parseInventoryAdjustmentSummaryType } from "../contracts/inventoryAdjustmentSummary";
import { fetchActiveWarehouses } from "../../warehouses/api";
import type { WarehouseListItem } from "../../warehouses/types";

import type { InventoryAdjustmentSummaryDetailOut } from "../contracts/inventoryAdjustmentSummary";

export type InventoryAdjustmentSummaryDetail = InventoryAdjustmentSummaryDetailOut;

type DetailMap = Record<string, InventoryAdjustmentSummaryDetail | undefined>;
type DetailLoadingMap = Record<string, boolean>;
type DetailErrorMap = Record<string, string>;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function parsePositiveInt(value: string | null | undefined): number | null {
  const n = Number(value ?? "");
  return Number.isFinite(n) && n > 0 ? n : null;
}

function buildRowKey(row: Pick<InventoryAdjustmentSummaryRowOut, "adjustment_type" | "object_id">) {
  return `${row.adjustment_type}-${row.object_id}`;
}

function warehouseLabel(warehouse: WarehouseListItem): string {
  const name = String(warehouse.name ?? "").trim();
  const code = String(warehouse.code ?? "").trim();
  const base = name || `仓库 ${warehouse.id}`;
  return code ? `${base}（${code}）` : base;
}

async function fetchRowDetail(
  row: InventoryAdjustmentSummaryRowOut,
): Promise<InventoryAdjustmentSummaryDetail> {
  return fetchInventoryAdjustmentSummaryDetail(row.adjustment_type, row.object_id);
}

export function useInventoryAdjustmentSummaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialType = parseInventoryAdjustmentSummaryType(
    searchParams.get("adjustment_type"),
  );
  const initialWarehouseId = parsePositiveInt(searchParams.get("warehouse_id"));

  const [adjustmentType, setAdjustmentType] =
    useState<InventoryAdjustmentSummaryType | null>(initialType);
  const [warehouseIdText, setWarehouseIdText] = useState(
    initialWarehouseId != null ? String(initialWarehouseId) : "",
  );

  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState("");

  const [rows, setRows] = useState<InventoryAdjustmentSummaryRowOut[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [detailByRowKey, setDetailByRowKey] = useState<DetailMap>({});
  const [detailLoadingByRowKey, setDetailLoadingByRowKey] =
    useState<DetailLoadingMap>({});
  const [detailErrorByRowKey, setDetailErrorByRowKey] = useState<DetailErrorMap>({});

  const warehouseId = useMemo(() => {
    const trimmed = warehouseIdText.trim();
    if (!trimmed) return null;
    return parsePositiveInt(trimmed);
  }, [warehouseIdText]);

  const warehouseNameById = useMemo(() => {
    const out: Record<number, string> = {};
    for (const warehouse of warehouses) {
      out[warehouse.id] = warehouseLabel(warehouse);
    }
    return out;
  }, [warehouses]);

  const syncSearch = useCallback(
    (
      nextType: InventoryAdjustmentSummaryType | null,
      nextWarehouseIdText: string,
    ) => {
      const params = new URLSearchParams();
      if (nextType) {
        params.set("adjustment_type", nextType);
      }
      const nextWarehouseId = parsePositiveInt(nextWarehouseIdText.trim());
      if (nextWarehouseId != null) {
        params.set("warehouse_id", String(nextWarehouseId));
      }
      setSearchParams(params);
    },
    [setSearchParams],
  );

  const loadWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    setWarehousesError("");
    try {
      const data = await fetchActiveWarehouses();
      setWarehouses(Array.isArray(data) ? data : []);
    } catch (err) {
      setWarehouses([]);
      setWarehousesError(getErrorMessage(err, "加载仓库列表失败"));
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInventoryAdjustmentSummary({
        adjustment_type: adjustmentType,
        warehouse_id: warehouseId,
        limit: 50,
        offset: 0,
      });
      setRows(Array.isArray(data.items) ? data.items : []);
      setTotal(Number.isFinite(data.total) ? data.total : 0);
    } catch (err) {
      setRows([]);
      setTotal(0);
      setError(getErrorMessage(err, "加载库存调节汇总失败"));
    } finally {
      setLoading(false);
    }
  }, [adjustmentType, warehouseId]);

  const loadDetail = useCallback(
    async (row: InventoryAdjustmentSummaryRowOut) => {
      const key = buildRowKey(row);
      if (detailByRowKey[key] || detailLoadingByRowKey[key]) return;

      setDetailLoadingByRowKey((prev) => ({ ...prev, [key]: true }));
      setDetailErrorByRowKey((prev) => ({ ...prev, [key]: "" }));

      try {
        const detail = await fetchRowDetail(row);
        setDetailByRowKey((prev) => ({ ...prev, [key]: detail }));
      } catch (err) {
        setDetailErrorByRowKey((prev) => ({
          ...prev,
          [key]: getErrorMessage(err, "加载库存调节详情失败"),
        }));
      } finally {
        setDetailLoadingByRowKey((prev) => ({ ...prev, [key]: false }));
      }
    },
    [detailByRowKey, detailLoadingByRowKey],
  );

  useEffect(() => {
    void loadWarehouses();
  }, [loadWarehouses]);

  useEffect(() => {
    syncSearch(adjustmentType, warehouseIdText);
  }, [adjustmentType, syncSearch, warehouseIdText]);

  useEffect(() => {
    setExpandedKey(null);
    void loadRows();
  }, [loadRows, reloadToken]);

  const selectAdjustmentType = useCallback((value: string) => {
    setAdjustmentType(parseInventoryAdjustmentSummaryType(value));
  }, []);

  const selectWarehouseId = useCallback((value: string) => {
    setWarehouseIdText(value);
  }, []);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const rowKey = useCallback((row: InventoryAdjustmentSummaryRowOut) => {
    return buildRowKey(row);
  }, []);

  const toggleExpand = useCallback(
    async (row: InventoryAdjustmentSummaryRowOut) => {
      const key = buildRowKey(row);
      if (expandedKey === key) {
        setExpandedKey(null);
        return;
      }
      setExpandedKey(key);
      await loadDetail(row);
    },
    [expandedKey, loadDetail],
  );

  return {
    rows,
    total,
    loading,
    error,

    adjustmentType,
    selectAdjustmentType,

    warehouses,
    warehousesLoading,
    warehousesError,
    warehouseIdText,
    selectWarehouseId,
    warehouseNameById,

    expandedKey,
    detailByRowKey,
    detailLoadingByRowKey,
    detailErrorByRowKey,
    rowKey,
    toggleExpand,

    reload,
  };
}
