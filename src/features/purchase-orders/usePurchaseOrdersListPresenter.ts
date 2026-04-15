import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPurchaseOrdersCompletion,
  type PurchaseOrderCompletionListItem,
} from "./api";

export type StatusFilter = "ALL" | "NOT_RECEIVED" | "PARTIAL" | "RECEIVED";

export interface PurchaseOrdersListState {
  rows: PurchaseOrderCompletionListItem[];
  loadingList: boolean;
  listError: string | null;
  supplierFilter: string;
  statusFilter: StatusFilter;
  searchText: string;
}

export interface PurchaseOrdersListActions {
  setSupplierFilter: (v: string) => void;
  setStatusFilter: (v: StatusFilter) => void;
  setSearchText: (v: string) => void;
  reload: () => void;
}

type PurchaseOrdersQuery = {
  limit: number;
  skip: number;
  supplier_id?: number;
  q?: string;
};

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

function matchesCompletionStatus(
  row: PurchaseOrderCompletionListItem,
  statusFilter: StatusFilter,
): boolean {
  if (statusFilter === "ALL") return true;
  return String(row.line_completion_status) === statusFilter;
}

export function usePurchaseOrdersListPresenter(): [
  PurchaseOrdersListState,
  PurchaseOrdersListActions,
] {
  const [rawRows, setRawRows] = useState<PurchaseOrderCompletionListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchText, setSearchText] = useState("");

  const loadRows = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const params: PurchaseOrdersQuery = { limit: 200, skip: 0 };

      if (supplierFilter.trim()) {
        const supplierId = Number(supplierFilter.trim());
        if (Number.isFinite(supplierId) && supplierId > 0) {
          params.supplier_id = supplierId;
        }
      }

      if (searchText.trim()) {
        params.q = searchText.trim();
      }

      const data = await fetchPurchaseOrdersCompletion(params);
      setRawRows(data);
    } catch (err) {
      console.error("loadRows failed", err);
      setListError(getErrorMessage(err, "加载采购完成情况失败"));
      setRawRows([]);
    } finally {
      setLoadingList(false);
    }
  }, [supplierFilter, searchText]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const rows = useMemo(
    () => rawRows.filter((row) => matchesCompletionStatus(row, statusFilter)),
    [rawRows, statusFilter],
  );

  return [
    {
      rows,
      loadingList,
      listError,
      supplierFilter,
      statusFilter,
      searchText,
    },
    {
      setSupplierFilter,
      setStatusFilter,
      setSearchText,
      reload: () => {
        void loadRows();
      },
    },
  ];
}

export type { PurchaseOrderCompletionListItem };
