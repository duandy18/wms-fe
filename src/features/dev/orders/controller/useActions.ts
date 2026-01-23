// src/features/dev/orders/controller/useActions.ts
import { useCallback, useMemo, useState } from "react";

import type { DevOrderInfo, DevOrderItemFact, DevOrderReconcileResult } from "../api/index";
import type { ActionLoading, DevOrdersTab } from "./types";

type RmaFromOrderPayload = {
  warehouse_id: number;
  lines: {
    item_id: number;
    qty: number;
    item_name?: string | null;
    batch_code?: string | null;
  }[];
};

type LinesPayload = { item_id: number; qty: number }[];

export function useDevOrdersActions(args: {
  order: DevOrderInfo | null;
  orderFacts: DevOrderItemFact[] | null;
  traceId: string | null;

  // controller wiring
  setError: (msg: string | null) => void;
  setActiveTab: (t: DevOrdersTab) => void;

  // refresh hooks
  reloadAll: () => Promise<void>;
  refetchLifecycle: () => void;

  // form helpers
  getErrorMessage: (e: unknown) => string;
  setForm: (next: { platform: string; shopId: string; extOrderNo: string }) => void;

  // ================================
  // 动作注入（useActions 不允许直接 import API）
  // ================================
  ingestDemoOrder: (p: { platform: string; shopId: string }) => Promise<{
    platform: string;
    shop_id: string;
    ext_order_no: string;
  }>;

  ensureOrderWarehouse: (p: { platform: string; shopId: string; extOrderNo: string }) => Promise<unknown>;

  reserveOrder: (p: { platform: string; shopId: string; extOrderNo: string; lines: LinesPayload }) => Promise<unknown>;

  pickOrder: (p: {
    platform: string;
    shopId: string;
    extOrderNo: string;
    warehouse_id: number;
    batch_code: string;
    lines: LinesPayload;
  }) => Promise<unknown>;

  shipOrder: (p: {
    platform: string;
    shopId: string;
    extOrderNo: string;
    warehouse_id: number;
    lines: LinesPayload;
  }) => Promise<unknown>;

  confirmShipViaDev: (p: {
    platform: string;
    shopId: string;
    extOrderNo: string;
    carrier?: string;
    traceId?: string | null;
  }) => Promise<unknown>;

  reconcileOrderById: (orderId: number) => Promise<DevOrderReconcileResult>;

  createReceiveTaskFromOrder: (orderId: number, payload: RmaFromOrderPayload) => Promise<unknown>;
}) {
  const { order, orderFacts, traceId } = args;

  const [actionLoading, setActionLoading] = useState<ActionLoading>(null);
  const [ensuringWarehouse, setEnsuringWarehouse] = useState(false);
  const [creatingRma, setCreatingRma] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<DevOrderReconcileResult | null>(null);

  const isBusy = useMemo(
    () => !!actionLoading || creatingRma || ensuringWarehouse,
    [actionLoading, creatingRma, ensuringWarehouse],
  );

  const handleQueryRefresh = useCallback(async () => {
    await args.reloadAll();
    args.refetchLifecycle();
    args.setActiveTab("flow");
  }, [args]);

  const handleDemoIngest = useCallback(
    async (form: { platform: string; shopId: string }) => {
      args.setError(null);
      try {
        const demo = await args.ingestDemoOrder({
          platform: form.platform.trim() || "PDD",
          shopId: form.shopId.trim() || "1",
        });

        args.setForm({ platform: demo.platform, shopId: demo.shop_id, extOrderNo: demo.ext_order_no });

        await args.reloadAll();
        args.refetchLifecycle();
        args.setActiveTab("flow");
      } catch (err: unknown) {
        args.setError(args.getErrorMessage(err) ?? "生成测试订单失败");
      }
    },
    [args],
  );

  const handleEnsureWarehouse = useCallback(async () => {
    if (!order) return;
    setEnsuringWarehouse(true);
    args.setError(null);

    try {
      await args.ensureOrderWarehouse({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
      });
      await handleQueryRefresh();
    } catch (err: unknown) {
      args.setError(args.getErrorMessage(err) ?? "解析仓库失败");
    } finally {
      setEnsuringWarehouse(false);
    }
  }, [order, args, handleQueryRefresh]);

  const handleReconcile = useCallback(async () => {
    if (!order) return;
    setReconcileLoading(true);
    try {
      const res = await args.reconcileOrderById(order.id);
      setReconcileResult(res);
    } catch (err: unknown) {
      args.setError(args.getErrorMessage(err) ?? "对账失败");
    } finally {
      setReconcileLoading(false);
    }
  }, [order, args]);

  const handleAction = useCallback(
    async (t: "reserve" | "pick" | "ship") => {
      if (!order) return;
      setActionLoading(t);
      args.setError(null);

      try {
        const itemId = orderFacts?.[0]?.item_id ?? 1;
        const qty = 1;

        if (t === "reserve") {
          await args.reserveOrder({
            platform: order.platform,
            shopId: order.shop_id,
            extOrderNo: order.ext_order_no,
            lines: [{ item_id: itemId, qty }],
          });
        } else if (t === "pick") {
          await args.pickOrder({
            platform: order.platform,
            shopId: order.shop_id,
            extOrderNo: order.ext_order_no,
            warehouse_id: order.warehouse_id ?? 1,
            batch_code: "AUTO",
            lines: [{ item_id: itemId, qty }],
          });
        } else {
          await args.shipOrder({
            platform: order.platform,
            shopId: order.shop_id,
            extOrderNo: order.ext_order_no,
            warehouse_id: order.warehouse_id ?? 1,
            lines: [{ item_id: itemId, qty }],
          });

          await args.confirmShipViaDev({
            platform: order.platform,
            shopId: order.shop_id,
            extOrderNo: order.ext_order_no,
            traceId,
            carrier: undefined,
          });
        }

        await handleQueryRefresh();
      } catch (err: unknown) {
        args.setError(args.getErrorMessage(err) ?? "操作失败");
      } finally {
        setActionLoading(null);
      }
    },
    [order, orderFacts, traceId, args, handleQueryRefresh],
  );

  const handleFullFlow = useCallback(async () => {
    if (!order) return;

    setActionLoading("full");
    args.setError(null);

    try {
      const lines: LinesPayload =
        orderFacts?.map((f) => ({
          item_id: f.item_id,
          qty: Math.max(1, f.qty_ordered || 1),
        })) || [];

      await args.reserveOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        lines,
      });

      await args.pickOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        warehouse_id: order.warehouse_id ?? 1,
        batch_code: "AUTO",
        lines,
      });

      await args.shipOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        warehouse_id: order.warehouse_id ?? 1,
        lines,
      });

      await args.confirmShipViaDev({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        traceId,
        carrier: undefined,
      });

      await handleQueryRefresh();
    } catch (err: unknown) {
      args.setError(args.getErrorMessage(err) ?? "全链路失败");
    } finally {
      setActionLoading(null);
    }
  }, [order, orderFacts, traceId, args, handleQueryRefresh]);

  const handleCreateRmaTask = useCallback(async () => {
    if (!order || !orderFacts) return;

    const candidates = orderFacts.filter((f) => f.qty_remaining_refundable > 0);
    if (candidates.length === 0) return args.setError("无可退数量");

    setCreatingRma(true);
    try {
      const payload: RmaFromOrderPayload = {
        warehouse_id: order.warehouse_id ?? 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_remaining_refundable,
          item_name: f.title ?? null,
          batch_code: null,
        })),
      };

      const task = await args.createReceiveTaskFromOrder(order.id, payload);
      void task;

      // 创建任务后刷新（可选，但更直观）
      await handleQueryRefresh();
    } catch (err: unknown) {
      args.setError(args.getErrorMessage(err) ?? "创建 RMA 失败");
    } finally {
      setCreatingRma(false);
    }
  }, [order, orderFacts, args, handleQueryRefresh]);

  return {
    actionLoading,
    setActionLoading,

    ensuringWarehouse,
    creatingRma,
    reconcileLoading,
    reconcileResult,
    isBusy,

    setReconcileResult,

    handleDemoIngest,
    handleEnsureWarehouse,
    handleAction,
    handleFullFlow,
    handleReconcile,
    handleCreateRmaTask,
  };
}
