// src/features/purchase-orders/usePurchaseOrdersListPresenter.ts

import { useCallback, useEffect, useState } from "react";
import {
  fetchPurchaseOrders,
  type PurchaseOrderWithLines,
} from "./api";

export type StatusFilter = "ALL" | "CREATED" | "PARTIAL" | "RECEIVED" | "CLOSED";

export interface PurchaseOrdersListState {
  orders: PurchaseOrderWithLines[];
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

/**
 * 采购单列表 Presenter：
 * - 管理过滤条件 / 列表数据 / 加载状态 / 错误；
 * - 提供 reload 方法；
 * - 默认首次挂载自动加载一次。
 */
export function usePurchaseOrdersListPresenter(): [
  PurchaseOrdersListState,
  PurchaseOrdersListActions,
] {
  const [orders, setOrders] = useState<PurchaseOrderWithLines[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const loadOrders = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const params: any = { limit: 50, skip: 0 };
      if (supplierFilter.trim()) params.supplier = supplierFilter.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;

      const data = await fetchPurchaseOrders(params);
      setOrders(data);
    } catch (err: any) {
      console.error("loadOrders failed", err);
      setListError(err?.message ?? "加载采购单失败");
      setOrders([]);
    } finally {
      setLoadingList(false);
    }
  }, [supplierFilter, statusFilter]);

  // 首次挂载自动加载一次；过滤条件变化时，可以手点“刷新”
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
