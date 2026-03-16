// src/features/orders/hooks/useOrderDetailPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  fetchOrderFactsById,
  fetchOrderViewById,
  type OrderFacts,
  type OrderView,
} from "../api/index";
import { createReceiveTaskFromOrder } from "../../receive-tasks/api";
import { getErrorMessage } from "../ui/errors";

type NavState =
  | undefined
  | {
      orderId?: number;
      platform?: string;
      shopId?: string;
      extOrderNo?: string;
    };

type OrderReconcileResult = {
  issues: string[];
} | null;

export function useOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = (location.state as NavState) || {};
  const orderIdNum = orderId ? Number(orderId) : NaN;

  const [orderView, setOrderView] = useState<OrderView | null>(null);
  const [facts, setFacts] = useState<OrderFacts | null>(null);
  const [reconcile, setReconcile] = useState<OrderReconcileResult>(null);

  const [loading, setLoading] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [creatingRma, setCreatingRma] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = orderView?.order ?? null;

  // 先保持 null；后续若正式合同补 trace_id，再接入
  const traceId: string | null = null;

  const hasRemainingRefundable = useMemo(() => {
    if (!facts?.items?.length) return false;
    return facts.items.some((i) => i.qty_remaining_refundable > 0);
  }, [facts]);

  const totals = useMemo(() => {
    if (!facts?.items?.length) {
      return { ordered: 0, shipped: 0, returned: 0, remaining: 0 };
    }
    return facts.items.reduce(
      (acc, f) => {
        acc.ordered += f.qty_ordered;
        acc.shipped += f.qty_shipped;
        acc.returned += f.qty_returned;
        acc.remaining += f.qty_remaining_refundable;
        return acc;
      },
      { ordered: 0, shipped: 0, returned: 0, remaining: 0 },
    );
  }, [facts]);

  const load = useCallback(async () => {
    if (!Number.isFinite(orderIdNum) || orderIdNum <= 0) {
      setError("URL 中的 orderId 无效。");
      return;
    }

    setLoading(true);
    setError(null);
    setReconcile(null);

    try {
      const [ov, of] = await Promise.all([
        fetchOrderViewById(orderIdNum),
        fetchOrderFactsById(orderIdNum),
      ]);

      setOrderView(ov);
      setFacts(of);
    } catch (err: unknown) {
      console.error("load order detail failed", err);
      setError(getErrorMessage(err, "加载订单详情失败"));
      setOrderView(null);
      setFacts(null);
    } finally {
      setLoading(false);
    }
  }, [orderIdNum]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReconcile = useCallback(async () => {
    if (!Number.isFinite(orderIdNum)) return;
    setReconcileLoading(true);
    setError(null);
    try {
      setReconcile({
        issues: facts?.issues ?? [],
      });
    } catch (err: unknown) {
      console.error("handleReconcile failed", err);
      setError(getErrorMessage(err, "对账失败"));
      setReconcile(null);
    } finally {
      setReconcileLoading(false);
    }
  }, [orderIdNum, facts]);

  const handleCreateRma = useCallback(async () => {
    if (!order || !facts || !facts.items?.length) return;

    const candidates = facts.items.filter((i) => i.qty_remaining_refundable > 0);
    if (!candidates.length) {
      setError("该订单当前没有剩余可退数量。");
      return;
    }

    setCreatingRma(true);
    setError(null);
    try {
      const payload = {
        warehouse_id: 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_remaining_refundable,
          item_name: f.title ?? null,
          batch_code: null as string | null,
        })),
      };

      const task = await createReceiveTaskFromOrder(order.id, payload);
      navigate(`/receive-tasks/${task.id}`);
    } catch (err: unknown) {
      console.error("createReceiveTaskFromOrder failed", err);
      setError(getErrorMessage(err, "创建退货任务失败"));
    } finally {
      setCreatingRma(false);
    }
  }, [order, facts, navigate]);

  const makeOrderRef = useCallback(() => {
    if (!order) return null;
    const plat = (order.platform || "").toUpperCase();
    return `ORD:${plat}:${order.shop_id}:${order.ext_order_no}`;
  }, [order]);

  const handleViewStock = useCallback(
    (itemId: number) => {
      const qs = new URLSearchParams();
      qs.set("item_id", String(itemId));
      navigate(`/tools/stocks?${qs.toString()}`);
    },
    [navigate],
  );

  const handleViewLedger = useCallback(() => {
    const ref = makeOrderRef();
    if (!ref) return;
    const qs = new URLSearchParams();
    qs.set("ref", ref);
    if (traceId) qs.set("trace_id", traceId);
    navigate(`/tools/ledger?${qs.toString()}`);
  }, [makeOrderRef, traceId, navigate]);

  const handleViewTrace = useCallback(() => {
    if (!traceId) {
      setError("当前订单详情未提供 trace_id，无法打开 Trace 视图。");
      return;
    }
    const qs = new URLSearchParams();
    qs.set("trace_id", traceId);
    navigate(`/trace?${qs.toString()}`);
  }, [traceId, navigate]);

  return {
    orderId,
    orderIdNum,

    orderView,
    facts,
    reconcile,

    loading,
    reconcileLoading,
    creatingRma,
    error,

    order,
    traceId,
    hasRemainingRefundable,
    totals,

    load,
    handleReconcile,
    handleCreateRma,
    handleViewStock,
    handleViewLedger,
    handleViewTrace,
    backToList: () => navigate(navState.orderId ? "/orders" : "/orders"),
  };
}
