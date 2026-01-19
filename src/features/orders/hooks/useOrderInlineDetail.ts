// src/features/orders/hooks/useOrderInlineDetail.ts
import { useCallback, useMemo, useState } from "react";
import { fetchOrderFacts, fetchOrderView, type OrderFacts, type OrderSummary, type OrderView } from "../api";

export function useOrderInlineDetail() {
  const [selectedSummary, setSelectedSummary] = useState<OrderSummary | null>(null);
  const [selectedView, setSelectedView] = useState<OrderView | null>(null);
  const [selectedFacts, setSelectedFacts] = useState<OrderFacts | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  const closeDetail = useCallback(() => {
    setSelectedSummary(null);
    setSelectedView(null);
    setSelectedFacts(null);
    setDetailError(null);
    setDetailLoading(false);
  }, []);

  const loadDetail = useCallback(async (summary: OrderSummary) => {
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
  }, []);

  return {
    selectedSummary,
    selectedView,
    selectedFacts,
    detailLoading,
    detailError,
    loadDetail,
    closeDetail,

    detailOrder,
    detailFacts,
    detailTotals,
  };
}
