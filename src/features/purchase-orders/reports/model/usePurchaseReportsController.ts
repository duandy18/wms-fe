// 拆分说明：从页面层抽出报表页运行模型，统一承接筛选状态、加载流程、派生态与 loader 组合逻辑。路径：src/features/purchase-orders/reports/model/usePurchaseReportsController.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSuppliersLoader } from "../../create/presenter/useSuppliersLoader";
import { useItemsLoader } from "../../create/presenter/useItemsLoader";
import {
  fetchDailyReports,
  fetchItemReportLines,
  fetchItemReports,
  fetchReportSummary,
  fetchSupplierReports,
  fetchWarehouses,
} from "../api/reportsApi";
import type { ItemPurchaseReportLineItem } from "../api/reportsApi";
import type {
  DailyPurchaseReportItem,
  ItemPurchaseReportItem,
  ReportTab,
  SummaryPurchaseReportItem,
  SupplierPurchaseReportItem,
  TimeMode,
  WarehouseOut,
} from "../types";

export function usePurchaseReportsController() {
  const [tab, setTab] = useState<ReportTab>("items");
  const [timeMode, setTimeMode] = useState<TimeMode>("purchase_time");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [warehouses, setWarehouses] = useState<WarehouseOut[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState<string | null>(null);

  const [summary, setSummary] = useState<SummaryPurchaseReportItem | null>(null);
  const [itemsRows, setItemsRows] = useState<ItemPurchaseReportItem[]>([]);
  const [supplierRows, setSupplierRows] = useState<SupplierPurchaseReportItem[]>([]);
  const [dailyRows, setDailyRows] = useState<DailyPurchaseReportItem[]>([]);

  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [itemLineRowsByItemId, setItemLineRowsByItemId] = useState<
    Record<number, ItemPurchaseReportLineItem[]>
  >({});
  const [itemLineLoadingItemId, setItemLineLoadingItemId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { supplierOptions, suppliersLoading, suppliersError } = useSuppliersLoader();

  const selectedSupplierId = useMemo<number | null>(() => {
    const n = Number(supplierId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [supplierId]);

  const { itemOptions, itemsLoading, itemsError } = useItemsLoader({
    supplierId: selectedSupplierId,
  });

  useEffect(() => {
    setSelectedItemId("");
  }, [supplierId]);

  useEffect(() => {
    let alive = true;

    async function loadWarehouses() {
      setWarehousesLoading(true);
      setWarehousesError(null);

      try {
        const resp = await fetchWarehouses();
        if (!alive) return;
        setWarehouses(Array.isArray(resp.data) ? resp.data : []);
      } catch (e: unknown) {
        console.error("loadWarehouses failed", e);
        if (alive) setWarehousesError("加载仓库列表失败");
      } finally {
        if (alive) setWarehousesLoading(false);
      }
    }

    void loadWarehouses();

    return () => {
      alive = false;
    };
  }, []);

  const currentRowsCount = useMemo(() => {
    if (tab === "items") return itemsRows.length;
    if (tab === "suppliers") return supplierRows.length;
    return dailyRows.length;
  }, [tab, itemsRows.length, supplierRows.length, dailyRows.length]);

  const filters = useMemo(
    () => ({
      dateFrom,
      dateTo,
      warehouseId,
      supplierId,
      itemId: selectedItemId,
    }),
    [dateFrom, dateTo, warehouseId, supplierId, selectedItemId]
  );

  useEffect(() => {
    setExpandedItemId(null);
    setItemLineRowsByItemId({});
    setItemLineLoadingItemId(null);
  }, [filters, timeMode, tab]);

  const toggleItemExpand = useCallback(
    async (itemId: number) => {
      if (expandedItemId === itemId) {
        setExpandedItemId(null);
        return;
      }

      setExpandedItemId(itemId);

      if (itemLineRowsByItemId[itemId] != null) {
        return;
      }

      setItemLineLoadingItemId(itemId);

      try {
        const rows = await fetchItemReportLines(itemId, filters, timeMode);
        setItemLineRowsByItemId((prev) => ({
          ...prev,
          [itemId]: Array.isArray(rows) ? rows : [],
        }));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载商品采购明细失败";
        setError(msg);
        setItemLineRowsByItemId((prev) => ({
          ...prev,
          [itemId]: [],
        }));
      } finally {
        setItemLineLoadingItemId((current) => (current === itemId ? null : current));
      }
    },
    [expandedItemId, filters, itemLineRowsByItemId, timeMode]
  );

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        if (tab === "items") {
          const [summaryData, data] = await Promise.all([
            fetchReportSummary(filters, { tab, timeMode }),
            fetchItemReports(filters, timeMode),
          ]);
          if (!alive) return;
          setSummary(summaryData);
          setItemsRows(Array.isArray(data) ? data : []);
        } else if (tab === "suppliers") {
          const [summaryData, data] = await Promise.all([
            fetchReportSummary(filters, { tab, timeMode }),
            fetchSupplierReports(filters, timeMode),
          ]);
          if (!alive) return;
          setSummary(summaryData);
          setSupplierRows(Array.isArray(data) ? data : []);
        } else {
          const [summaryData, data] = await Promise.all([
            fetchReportSummary(filters, { tab, timeMode }),
            fetchDailyReports(filters),
          ]);
          if (!alive) return;
          setSummary(summaryData);
          setDailyRows(Array.isArray(data) ? data : []);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "加载采购报表失败";
        if (!alive) return;
        setError(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, [filters, tab, timeMode]);

  return {
    tab,
    setTab,
    timeMode,
    setTimeMode,
    warehouseId,
    setWarehouseId,
    supplierId,
    setSupplierId,
    selectedItemId,
    setSelectedItemId,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,

    warehouses,
    warehousesLoading,
    warehousesError,

    supplierOptions,
    suppliersLoading,
    suppliersError,

    selectedSupplierId,
    itemOptions,
    itemsLoading,
    itemsError,

    summary,
    itemsRows,
    supplierRows,
    dailyRows,

    expandedItemId,
    itemLineRowsByItemId,
    itemLineLoadingItemId,
    toggleItemExpand,

    loading,
    error,
    currentRowsCount,
  };
}

export type PurchaseReportsController = ReturnType<typeof usePurchaseReportsController>;
