// src/features/dev/orders/controller/index.ts
import React, { useEffect, useState } from "react";

import type { DevOrderContext, ScenarioType } from "../DevOrdersPanel";
import {
  fetchDevOrderView,
  fetchDevOrderFacts,
  fetchTraceById,
  ingestDemoOrder,
  ensureOrderWarehouse,
  reserveOrder,
  pickOrder,
  shipOrder,
  confirmShipViaDev,
  reconcileOrderById,
  type DevOrderInfo,
  type DevOrderItemFact,
  type DevOrderReconcileResult,
  type DevOrderView,
  type TraceEvent as DevTraceEvent,
} from "../api/index";

import { useDevOrderLifecycle } from "../useDevOrderLifecycle";
import { createReceiveTaskFromOrder } from "../../../receive-tasks/api";
import { useScenarios } from "./useScenarios";
import { useDevOrdersActions } from "./useActions";
import type { ActionLoading, DevOrdersTab, FormState } from "./types";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

type Props = {
  initialPlatform?: string;
  initialShopId?: string;
  initialExtOrderNo?: string;
  autoQuery?: boolean;
  onContextChange?: (ctx: DevOrderContext) => void;
};

export function useDevOrdersController(props: Props) {
  const [form, setForm] = useState<FormState>({
    platform: props.initialPlatform || "PDD",
    shopId: props.initialShopId || "1",
    extOrderNo: props.initialExtOrderNo || "",
  });

  const onChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const [loading, setLoading] = useState(false);
  const [orderView, setOrderView] = useState<DevOrderView | null>(null);
  const [orderFacts, setOrderFacts] = useState<DevOrderItemFact[] | null>(null);
  const [traceEvents, setTraceEvents] = useState<DevTraceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DevOrdersTab>("flow");

  const order: DevOrderInfo | null = orderView?.order ?? null;
  const traceId: string | null = orderView?.trace_id ?? orderView?.order?.trace_id ?? null;

  const lifecycle = useDevOrderLifecycle(traceId, orderFacts);

  async function loadOrderAndTraceFor(platform: string, shopId: string, extOrderNo: string) {
    setLoading(true);
    setError(null);

    try {
      const ov = await fetchDevOrderView({ platform, shopId, extOrderNo });
      setOrderView(ov);

      if (props.onContextChange && ov?.order) {
        props.onContextChange({
          platform: ov.order.platform,
          shopId: ov.order.shop_id,
          extOrderNo: ov.order.ext_order_no,
          traceId: ov.trace_id ?? ov.order.trace_id ?? null,
        });
      }

      const facts = await fetchDevOrderFacts({ platform, shopId, extOrderNo });
      setOrderFacts(facts.items || []);

      const tid = ov.trace_id ?? ov.order.trace_id ?? null;
      if (tid) {
        const tr = await fetchTraceById(tid);
        setTraceEvents(tr.events || []);
      } else {
        setTraceEvents([]);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "加载订单失败");
      setOrderView(null);
      setOrderFacts(null);
      setTraceEvents([]);
    } finally {
      setLoading(false);
    }
  }

  const loadOrderAndTrace = () =>
    loadOrderAndTraceFor(form.platform.trim(), form.shopId.trim(), form.extOrderNo.trim());

  // 统一动作（纯注入）
  const actions = useDevOrdersActions({
    order,
    orderFacts,
    traceId,

    setError,
    setActiveTab,

    reloadAll: loadOrderAndTrace,
    refetchLifecycle: () => lifecycle.refetch(),

    getErrorMessage,
    setForm,

    // 注入 API（composition root）
    ingestDemoOrder,
    ensureOrderWarehouse,
    reserveOrder,
    pickOrder,
    shipOrder,
    confirmShipViaDev,
    reconcileOrderById,
    createReceiveTaskFromOrder,
  });

  // ✅ scenarios 必须在 loadOrderAndTrace 定义之后创建（否则 TS2448）
  const scenarios = useScenarios({
    order,
    orderFacts,
    traceId,
    setError,
    setActionLoading: actions.setActionLoading,
    setActiveTab,
    loadOrderAndTrace,
    refetchLifecycle: () => lifecycle.refetch(),
    reserveOrder,
    pickOrder,
    shipOrder,
    confirmShipViaDev,
    handleFullFlow: actions.handleFullFlow,
    createReceiveTaskFromOrder,
    getErrorMessage,
  });

  useEffect(() => {
    if (props.autoQuery && props.initialExtOrderNo) {
      void loadOrderAndTraceFor(
        props.initialPlatform || "PDD",
        props.initialShopId || "1",
        props.initialExtOrderNo,
      ).then(() => lifecycle.refetch());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleQuery(e: React.FormEvent) {
    e.preventDefault();
    await loadOrderAndTrace();
    lifecycle.refetch();
    setActiveTab("flow");
  }

  async function handleScenario(s: ScenarioType) {
    await scenarios.handleScenario(s);
  }

  // ✅ 保持 UI 兼容：旧按钮调用 handleDemoIngest()（无参）
  async function handleDemoIngest() {
    await actions.handleDemoIngest({ platform: form.platform, shopId: form.shopId });
  }

  const isBusy = actions.isBusy;

  return {
    form,
    onChange,

    loading,
    error,

    order,
    orderFacts,
    traceEvents,
    traceId,

    lifecycle,

    // actions state
    actionLoading: actions.actionLoading as ActionLoading,
    ensuringWarehouse: actions.ensuringWarehouse,
    creatingRma: actions.creatingRma,
    reconcileLoading: actions.reconcileLoading,
    reconcileResult: actions.reconcileResult as DevOrderReconcileResult | null,

    activeTab,
    setActiveTab,

    isBusy,

    handleQuery,
    handleDemoIngest,
    handleEnsureWarehouse: actions.handleEnsureWarehouse,
    handleAction: actions.handleAction,
    handleFullFlow: actions.handleFullFlow,
    handleReconcile: actions.handleReconcile,
    handleCreateRmaTask: actions.handleCreateRmaTask,
    handleScenario,
  };
}
