// src/features/orders/hooks/useOrderDetailPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { fetchOrderFacts, fetchOrderView, type OrderFacts, type OrderView } from "../api/index";
import { reconcileOrderById, type DevOrderReconcileResult } from "../../dev/orders/api/index";
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

export function useOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = (location.state as NavState) || {};
  const orderIdNum = orderId ? Number(orderId) : NaN;

  const [orderView, setOrderView] = useState<OrderView | null>(null);
  const [facts, setFacts] = useState<OrderFacts | null>(null);
  const [reconcile, setReconcile] = useState<DevOrderReconcileResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [creatingRma, setCreatingRma] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = orderView?.order ?? null;

  // ✅ PlatformOrder（平台订单镜像）不携带 trace_id；OrderFacts 也不携带 order 字段
  // ✅ 这里先降级为 null（后续若后端补齐合同字段，再做“合同驱动化”的接入）
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
    if (!Number.isFinite(orderIdNum)) {
      setError("URL 中的 orderId 无效。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let plat = navState.platform;
      let shop = navState.shopId;
      let ext = navState.extOrderNo;

      if (!plat || !shop || !ext) {
        const recon = await reconcileOrderById(orderIdNum);
        plat = recon.platform;
        shop = recon.shop_id;
        ext = recon.ext_order_no;
      }

      if (!plat || !shop || !ext) {
        throw new Error("缺少平台/店铺/外部订单号信息。");
      }

      const ov = await fetchOrderView({ platform: plat, shopId: shop, extOrderNo: ext });
      setOrderView(ov);

      const of = await fetchOrderFacts({ platform: plat, shopId: shop, extOrderNo: ext });
      setFacts(of);
    } catch (err: unknown) {
      console.error("load order detail failed", err);
      setError(getErrorMessage(err, "加载订单详情失败"));
      setOrderView(null);
      setFacts(null);
    } finally {
      setLoading(false);
    }
  }, [orderIdNum, navState.platform, navState.shopId, navState.extOrderNo]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReconcile = useCallback(async () => {
    if (!Number.isFinite(orderIdNum)) return;
    setReconcileLoading(true);
    setError(null);
    try {
      const res = await reconcileOrderById(orderIdNum);
      setReconcile(res);
    } catch (err: unknown) {
      console.error("reconcileOrderById failed", err);
      setError(getErrorMessage(err, "对账失败"));
      setReconcile(null);
    } finally {
      setReconcileLoading(false);
    }
  }, [orderIdNum]);

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
        // ✅ PlatformOrder 不提供 warehouse_id；这里保留原先默认值
        // TODO: 后端若提供“执行仓/服务仓/默认仓”等合同字段，再改为合同驱动
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
      if (!order) return;
      const qs = new URLSearchParams();
      qs.set("item_id", String(itemId));
      // ✅ 不再附带 warehouse_id：PlatformOrder 不提供该字段
      navigate(`/tools/stocks?${qs.toString()}`);
    },
    [order, navigate],
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
    if (!traceId) return;
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
    backToList: () => navigate("/orders"),
  };
}
