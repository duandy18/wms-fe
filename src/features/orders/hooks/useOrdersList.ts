// src/features/orders/hooks/useOrdersList.ts
import { useCallback, useEffect, useMemo, useState } from "react";
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

function isShippedRow(r: OrderSummary): boolean {
  const fs = String(r.fulfillment_status ?? "").trim().toUpperCase();
  const st = String(r.status ?? "").trim().toUpperCase();

  if (fs === "SHIPPED") return true;
  if (st === "SHIPPED") return true;

  return false;
}

export function useOrdersList(args?: { initialPlatform?: string; limit?: number }) {
  const [filters, setFilters] = useState<OrdersListFilters>({
    // ❗不再默认给 platform
    platform: args?.initialPlatform ?? "",
    shopId: "",
    status: "",
    timeFrom: "",
    timeTo: "",
    limit: args?.limit ?? 100,
  });

  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedPlatform = useMemo(
    () => filters.platform.trim(),
    [filters.platform]
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: OrdersSummaryQuery = { limit: filters.limit };

      // ✅ 不再强制 platform
      if (normalizedPlatform) params.platform = normalizedPlatform;

      if (filters.shopId.trim()) params.shopId = filters.shopId.trim();
      if (filters.status.trim()) params.status = filters.status.trim();

      if (filters.timeFrom.trim())
        params.time_from = `${filters.timeFrom.trim()}T00:00:00Z`;

      if (filters.timeTo.trim())
        params.time_to = `${filters.timeTo.trim()}T23:59:59Z`;

      const resp = await fetchOrdersSummary(params);

      const data = Array.isArray(resp.data) ? resp.data : [];

      // 前端兜底：排除已发运
      const notShipped = data.filter((r) => !isShippedRow(r));

      setRows(notShipped);
      setWarehouses(Array.isArray(resp.warehouses) ? resp.warehouses : []);
    } catch (err: unknown) {
      console.error("fetchOrdersSummary failed", err);
      const msg = err instanceof Error ? err.message : "加载订单列表失败";
      setError(msg);
      setRows([]);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.limit,
    filters.shopId,
    filters.status,
    filters.timeFrom,
    filters.timeTo,
    normalizedPlatform,
  ]);

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
