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

  // ✅ 以 fulfillment_status 为主（Phase 5.x 发货状态），同时兼容旧 status=SHIPPED
  if (fs === "SHIPPED") return true;
  if (st === "SHIPPED") return true;

  return false;
}

export function useOrdersList(args?: { initialPlatform?: string; limit?: number }) {
  const [filters, setFilters] = useState<OrdersListFilters>({
    platform: args?.initialPlatform ?? "PDD",
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

  const normalizedPlatform = useMemo(() => filters.platform.trim(), [filters.platform]);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: OrdersSummaryQuery = { limit: filters.limit };

      // 仍保留 filters 接口，供其他模块（如 Pick Sidebar）复用
      if (normalizedPlatform) params.platform = normalizedPlatform;
      if (filters.shopId.trim()) params.shopId = filters.shopId.trim();
      if (filters.status.trim()) params.status = filters.status.trim();

      // 时间过滤仍支持（OrdersPage 不展示查询卡，但其他地方可能会用）
      if (filters.timeFrom.trim()) params.time_from = `${filters.timeFrom.trim()}T00:00:00Z`;
      if (filters.timeTo.trim()) params.time_to = `${filters.timeTo.trim()}T23:59:59Z`;

      const resp = await fetchOrdersSummary(params);

      const data = Array.isArray(resp.data) ? resp.data : [];

      // ✅ 本页主用途：未发运订单作业台（已发运订单进入“订单统计”）
      // 注意：这里是前端兜底过滤，后端不变更契约
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
  }, [filters.limit, filters.shopId, filters.status, filters.timeFrom, filters.timeTo, normalizedPlatform]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  return {
    // ✅ 兼容旧调用方（OrderPickSidebar / OrdersFiltersPanel）
    filters,
    setFilters,

    // ✅ 核心数据
    rows,
    warehouses,
    loading,
    error,
    loadList,
  };
}
