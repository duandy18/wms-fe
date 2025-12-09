// src/features/purchase-orders/usePurchaseReportsPresenter.ts

import { useCallback, useState } from "react";
import {
  fetchSupplierReport,
  fetchItemReport,
  fetchDailyReport,
  type SupplierReportRow,
  type ItemReportRow,
  type DailyReportRow,
  type PurchaseReportFilters,
} from "./reportsApi";

export type TabKey = "suppliers" | "items" | "daily";

export interface PurchaseReportsState {
  activeTab: TabKey;
  filters: PurchaseReportFilters;
  supplierRows: SupplierReportRow[];
  itemRows: ItemReportRow[];
  dailyRows: DailyReportRow[];
  loading: boolean;
  error: string | null;
}

export interface PurchaseReportsActions {
  setActiveTab: (tab: TabKey) => void;
  setFilters: (
    updater: (prev: PurchaseReportFilters) => PurchaseReportFilters,
  ) => void;
  loadReports: () => Promise<void>;
}

const today = new Date();
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const DEFAULT_FILTERS: PurchaseReportFilters = {
  dateFrom: toYMD(firstDayOfMonth),
  dateTo: toYMD(today),
};

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export function usePurchaseReportsPresenter(): [
  PurchaseReportsState,
  PurchaseReportsActions,
] {
  const [activeTab, setActiveTab] = useState<TabKey>("suppliers");
  const [filters, setFilters] =
    useState<PurchaseReportFilters>(DEFAULT_FILTERS);

  const [supplierRows, setSupplierRows] = useState<SupplierReportRow[]>([]);
  const [itemRows, setItemRows] = useState<ItemReportRow[]>([]);
  const [dailyRows, setDailyRows] = useState<DailyReportRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "suppliers") {
        const rows = await fetchSupplierReport(filters);
        setSupplierRows(rows);
      } else if (activeTab === "items") {
        const rows = await fetchItemReport(filters);
        setItemRows(rows);
      } else {
        const rows = await fetchDailyReport(filters);
        setDailyRows(rows);
      }
    } catch (err) {
      console.error("loadReports failed", err);
      setError(getErrorMessage(err, "加载采购报表失败"));
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  return [
    {
      activeTab,
      filters,
      supplierRows,
      itemRows,
      dailyRows,
      loading,
      error,
    },
    {
      setActiveTab,
      setFilters: (updater) =>
        setFilters((prev) => updater(prev)),
      loadReports,
    },
  ];
}
