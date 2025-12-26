// src/features/orders/page/hooks/useOrdersPageModel.ts
//
// OrdersPage 状态 / orchestration
// - 过滤器 state
// - 列表加载
// - 详情加载（view + facts）
// - 详情派生：facts totals / devConsoleHref

import { useEffect, useMemo, useState } from "react";
import { fetchOrdersList, fetchOrderView, fetchOrderFacts, type OrderSummary, type OrderView, type OrderFacts } from "../../api";
import { buildDevConsoleHref, buildListParams } from "../utils";

export function useOrdersPageModel() {
  // filters
  const [platform, setPlatform] = useState("PDD");
  const [shopId, setShopId] = useState("");
  const [status, setStatus] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [limit, setLimit] = useState(100);

  // list
  const [rows, setRows] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // detail
  const [selectedSummary, setSelectedSummary] = useState<OrderSummary | null>(null);
  const [selectedView, setSelectedView] = useState<OrderView | null>(null);
  const [selectedFacts, setSelectedFacts] = useState<OrderFacts | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const params = buildListParams({ platform, shopId, status, timeFrom, timeTo, limit });
      const list = await fetchOrdersList(params);
      setRows(list);

      // 如果当前选中的订单已经不在列表里了，顺便清掉详情
      if (selectedSummary && !list.some((r) => r.id === selectedSummary.id)) {
        setSelectedSummary(null);
        setSelectedView(null);
        setSelectedFacts(null);
        setDetailError(null);
      }
    } catch (err: unknown) {
      console.error("fetchOrdersList failed", err);
      const msg = err instanceof Error ? err.message : "加载订单列表失败";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDetail(summary: OrderSummary) {
    setSelectedSummary(summary);
    setSelectedView(null);
    setSelectedFacts(null);
    setDetailError(null);
    setDetailLoading(true);

    try {
      const ov = await fetchOrderView({
        platform: summary.platform,
        shopId: summary.shop_id,
        extOrderNo: summary.ext_order_no,
      });
      setSelectedView(ov);

      const of = await fetchOrderFacts({
        platform: summary.platform,
        shopId: summary.shop_id,
        extOrderNo: summary.ext_order_no,
      });
      setSelectedFacts(of);
    } catch (err: unknown) {
      console.error("load order detail failed", err);
      const msg = err instanceof Error ? err.message : "加载订单详情失败";
      setDetailError(msg);
      setSelectedView(null);
      setSelectedFacts(null);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedSummary(null);
    setSelectedView(null);
    setSelectedFacts(null);
    setDetailError(null);
  }

  const detailOrder = selectedView?.order ?? null;

  const detailFacts = useMemo(() => selectedFacts?.items ?? [], [selectedFacts]);

  const detailTotals = useMemo(() => {
    if (!detailFacts.length) return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };

    return detailFacts.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [detailFacts]);

  const devConsoleHref = useMemo(() => buildDevConsoleHref(detailOrder), [detailOrder]);

  return {
    // filters
    platform,
    setPlatform,
    shopId,
    setShopId,
    status,
    setStatus,
    timeFrom,
    setTimeFrom,
    timeTo,
    setTimeTo,
    limit,
    setLimit,

    // list
    rows,
    loading,
    error,
    loadList,

    // detail
    selectedSummary,
    detailOrder,
    selectedView,
    selectedFacts,
    detailFacts,
    detailTotals,
    detailLoading,
    detailError,
    loadDetail,
    closeDetail,

    devConsoleHref,
  };
}

export default useOrdersPageModel;
