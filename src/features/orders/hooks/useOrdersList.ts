// src/features/orders/hooks/useOrdersList.ts
import { useCallback, useEffect, useState } from "react";
import { fetchOrdersSummary, type OrderSummary, type WarehouseOption } from "../api/index";

export type OrdersListFilters = {
  platform: string;
  shopId: string;
  status: string;
  timeFrom: string; // YYYY-MM-DD
  timeTo: string; // YYYY-MM-DD
  limit: number;
};

type OrdersSummaryQuery = {
  platform?: string;
  shopId?: string;
  status?: string;
  time_from?: string;
  time_to?: string;
  limit?: number;
};

export function useOrdersList(args?: { initialPlatform?: string }) {
  const [filters, setFilters] = useState<OrdersListFilters>({
    platform: args?.initialPlatform ?? "PDD",
    shopId: "",
    status: "",
    timeFrom: "",
    timeTo: "",
    limit: 100,
  });

  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: OrdersSummaryQuery = { limit: filters.limit };

      if (filters.platform.trim()) params.platform = filters.platform.trim();
      if (filters.shopId.trim()) params.shopId = filters.shopId.trim();
      if (filters.status.trim()) params.status = filters.status.trim();
      if (filters.timeFrom.trim()) params.time_from = `${filters.timeFrom.trim()}T00:00:00Z`;
      if (filters.timeTo.trim()) params.time_to = `${filters.timeTo.trim()}T23:59:59Z`;

      const resp = await fetchOrdersSummary(params);
      setRows(resp.data || []);
      setWarehouses(resp.warehouses || []);
    } catch (err: unknown) {
      console.error("fetchOrdersSummary failed", err);
      const msg = err instanceof Error ? err.message : "加载订单列表失败";
      setError(msg);
      setRows([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.platform, filters.shopId, filters.status, filters.timeFrom, filters.timeTo]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  return {
    filters,
    setFilters,
    rows,
    warehouses,
    loading,
    error,
    loadList,
  };
}
