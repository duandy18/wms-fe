// src/features/purchase-orders/usePurchaseOrdersListPresenter.ts

import { useCallback, useEffect, useState } from "react";
import { fetchPurchaseOrders, type PurchaseOrderListItem } from "./api";

export type StatusFilter =
  | "ALL"
  | "CREATED"
  | "PARTIAL"
  | "RECEIVED"
  | "CLOSED";

export interface PurchaseOrdersListState {
  orders: PurchaseOrderListItem[];
  loadingList: boolean;
  listError: string | null;
  supplierFilter: string;
  statusFilter: StatusFilter;
}

export interface PurchaseOrdersListActions {
  setSupplierFilter: (v: string) => void;
  setStatusFilter: (v: StatusFilter) => void;
  reload: () => void;
}

type PurchaseOrdersQuery = {
  limit: number;
  skip: number;
  supplier?: string;
  status?: StatusFilter;
};

type ApiErrorShape = {
  message?: string;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const e = err as ApiErrorShape;
  return e?.message ?? fallback;
};

export function usePurchaseOrdersListPresenter(): [
  PurchaseOrdersListState,
  PurchaseOrdersListActions,
] {
  const [orders, setOrders] = useState<PurchaseOrderListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const loadOrders = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const params: PurchaseOrdersQuery = { limit: 50, skip: 0 };
      if (supplierFilter.trim()) {
        params.supplier = supplierFilter.trim();
      }
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const data = await fetchPurchaseOrders(params);
      setOrders(data);
    } catch (err) {
      console.error("loadOrders failed", err);
      setListError(getErrorMessage(err, "加载采购单失败"));
      setOrders([]);
    } finally {
      setLoadingList(false);
    }
  }, [supplierFilter, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return [
    {
      orders,
      loadingList,
      listError,
      supplierFilter,
      statusFilter,
    },
    {
      setSupplierFilter,
      setStatusFilter,
      reload: () => {
        void loadOrders();
      },
    },
  ];
}
