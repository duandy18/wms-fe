// src/features/dev/orders/DevOrdersPanel.tsx
// ===============================================
// 订单链路调试中控（DevConsole Orders）
// - 中控：状态管理、API 调用、Tab 切换
// - 生命周期只在这里计算一次，子组件只展示
// - 调试场景（Scenarios）也在这里落地调用真实 API
// ===============================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchDevOrderView,
  fetchDevOrderFacts,
  fetchTraceById,
  reserveOrder,
  pickOrder,
  shipOrder,
  reconcileOrderById,
  ingestDemoOrder,
  ensureOrderWarehouse,
  confirmShipViaDev, // ⭐ 新增：调用 /ship/confirm
  type DevOrderInfo,
  type DevOrderItemFact,
  type DevOrderView,
  type DevOrderReconcileResult,
  type TraceEvent as DevTraceEvent,
} from "./api";

import { useDevOrderLifecycle } from "./useDevOrderLifecycle";

import { DevOrderProvider } from "./DevOrderContext";
import { DevOrdersTabs } from "./DevOrdersTabs";
import { DevOrderFlowPanel } from "./DevOrderFlowPanel";
import { DevOrderScenariosPanel } from "./DevOrderScenariosPanel";
import { DevOrderToolsPanel } from "./DevOrderToolsPanel";
import { DevOrderTraceCard } from "./DevOrderTraceCard";

import { createReceiveTaskFromOrder } from "../../receive-tasks/api";

// 调试场景类型：与 DevOrderScenariosPanel 中的按钮一一对应
export type ScenarioType =
  | "normal_fullflow" // 正常履约：reserve → pick → ship
  | "under_pick" // 拣货不足：预占足量，只拣一半，不发货
  | "oversell" // 预占超量：预占为下单数量的 2 倍
  | "return_flow"; // 退货链路：履约后创建 RMA 收货任务

export type DevOrderContext = {
  platform: string;
  shopId: string;
  extOrderNo: string;
  traceId?: string | null;
};

type Props = {
  initialPlatform?: string;
  initialShopId?: string;
  initialExtOrderNo?: string;
  autoQuery?: boolean;
  onContextChange?: (ctx: DevOrderContext) => void;
};

type FormState = {
  platform: string;
  shopId: string;
  extOrderNo: string;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "未知错误";
  }
};

export const DevOrdersPanel: React.FC<Props> = ({
  initialPlatform,
  initialShopId,
  initialExtOrderNo,
  autoQuery,
  onContextChange,
}) => {
  const navigate = useNavigate();

  // 查询表单
  const [form, setForm] = useState<FormState>({
    platform: initialPlatform || "PDD",
    shopId: initialShopId || "1",
    extOrderNo: initialExtOrderNo || "",
  });

  const onChange =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  // 订单 / facts / trace
  const [loading, setLoading] = useState(false);
  const [orderView, setOrderView] = useState<DevOrderView | null>(null);
  const [orderFacts, setOrderFacts] = useState<DevOrderItemFact[] | null>(
    null,
  );
  const [traceEvents, setTraceEvents] = useState<DevTraceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 动作状态
  const [actionLoading, setActionLoading] = useState<
    null | "reserve" | "pick" | "ship" | "full"
  >(null);
  const [ensuringWarehouse, setEnsuringWarehouse] = useState(false);
  const [creatingRma, setCreatingRma] = useState(false);
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconcileResult, setReconcileResult] =
    useState<DevOrderReconcileResult | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"flow" | "scenarios" | "tools">(
    "flow",
  );

  const order: DevOrderInfo | null = orderView?.order ?? null;
  const traceId: string | null =
    orderView?.trace_id ?? orderView?.order?.trace_id ?? null;

  // 生命周期：唯一 hook 调用点
  const {
    stages: lifecycleStages,
    summary: lifecycleSummary,
    consistencyIssues: lifecycleConsistencyIssues,
    loading: lifecycleLoading,
    error: lifecycleError,
    hasReserved,
    hasShipped,
    forbidScenarios,
    refetch: refetchLifecycle,
  } = useDevOrderLifecycle(traceId, orderFacts);

  // 加载 order + facts + trace
  async function loadOrderAndTraceFor(
    platform: string,
    shopId: string,
    extOrderNo: string,
  ) {
    setLoading(true);
    setError(null);

    try {
      const ov = await fetchDevOrderView({ platform, shopId, extOrderNo });
      setOrderView(ov);

      if (onContextChange && ov?.order) {
        onContextChange({
          platform: ov.order.platform,
          shopId: ov.order.shop_id,
          extOrderNo: ov.order.ext_order_no,
          traceId: ov.trace_id ?? ov.order.trace_id ?? null,
        });
      }

      const facts = await fetchDevOrderFacts({
        platform,
        shopId,
        extOrderNo,
      });
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
    loadOrderAndTraceFor(
      form.platform.trim(),
      form.shopId.trim(),
      form.extOrderNo.trim(),
    );

  // 初次自动查询
  useEffect(() => {
    if (autoQuery && initialExtOrderNo) {
      loadOrderAndTraceFor(
        initialPlatform || "PDD",
        initialShopId || "1",
        initialExtOrderNo,
      ).then(() => refetchLifecycle());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 表单提交
  async function handleQuery(e: React.FormEvent) {
    e.preventDefault();
    await loadOrderAndTrace();
    refetchLifecycle();
    setActiveTab("flow");
  }

  // 解析仓库
  async function handleEnsureWarehouse() {
    if (!order) return;
    setEnsuringWarehouse(true);
    setError(null);

    try {
      await ensureOrderWarehouse({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
      });
      await loadOrderAndTrace();
      refetchLifecycle();
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "解析仓库失败");
    } finally {
      setEnsuringWarehouse(false);
    }
  }

  // 动作：reserve / pick / ship
  async function handleAction(type: "reserve" | "pick" | "ship") {
    if (!order) return;
    setActionLoading(type);
    setError(null);

    try {
      const itemId = orderFacts?.[0]?.item_id ?? 1;
      const qty = 1;

      if (type === "reserve") {
        await reserveOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          lines: [{ item_id: itemId, qty }],
        });
      } else if (type === "pick") {
        await pickOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          warehouse_id: order.warehouse_id ?? 1,
          batch_code: "AUTO",
          lines: [{ item_id: itemId, qty }],
        });
      } else {
        // 发运：保持原有 shipOrder（扣库存），再调用 /ship/confirm 写发货事件
        await shipOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          warehouse_id: order.warehouse_id ?? 1,
          lines: [{ item_id: itemId, qty }],
        });

        await confirmShipViaDev({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          traceId,
          carrier: undefined, // Dev 环境暂时不选快递公司
        });
      }

      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "操作失败");
    } finally {
      setActionLoading(null);
    }
  }

  // 全链路：按实际下单数量 reserve → pick → ship
  async function handleFullFlow() {
    if (!order) return;

    setActionLoading("full");
    setError(null);

    try {
      const lines =
        orderFacts?.map((f) => ({
          item_id: f.item_id,
          qty: Math.max(1, f.qty_ordered || 1),
        })) || [];

      await reserveOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        lines,
      });

      await pickOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        warehouse_id: order.warehouse_id ?? 1,
        batch_code: "AUTO",
        lines,
      });

      await shipOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        warehouse_id: order.warehouse_id ?? 1,
        lines,
      });

      // 同步写发货事件 + shipping_records
      await confirmShipViaDev({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        traceId,
        carrier: undefined,
      });

      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "全链路失败");
    } finally {
      setActionLoading(null);
    }
  }

  // 对账
  async function handleReconcile() {
    if (!order) return;
    setReconcileLoading(true);

    try {
      const res = await reconcileOrderById(order.id);
      setReconcileResult(res);
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "对账失败");
    } finally {
      setReconcileLoading(false);
    }
  }

  // 从订单创建 RMA 收货任务（单次操作版本）
  async function handleCreateRmaTask() {
    if (!order || !orderFacts) return;

    const candidates = orderFacts.filter(
      (f) => f.qty_remaining_refundable > 0,
    );
    if (candidates.length === 0) {
      setError("无可退数量");
      return;
    }

    setCreatingRma(true);
    try {
      const payload = {
        warehouse_id: order.warehouse_id ?? 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_remaining_refundable,
          item_name: f.title ?? null,
          batch_code: null,
        })),
      };

      const task = await createReceiveTaskFromOrder(order.id, payload);
      navigate(`/receive-tasks/${task.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "创建 RMA 失败");
    } finally {
      setCreatingRma(false);
    }
  }

  // demo ingest
  async function handleDemoIngest() {
    setError(null);

    try {
      const demo = await ingestDemoOrder({
        platform: form.platform.trim() || "PDD",
        shopId: form.shopId.trim() || "1",
      });

      const next = {
        platform: demo.platform,
        shopId: demo.shop_id,
        extOrderNo: demo.ext_order_no,
      };
      setForm(next);

      await loadOrderAndTraceFor(
        demo.platform,
        demo.shop_id,
        demo.ext_order_no,
      );
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "生成测试订单失败");
    }
  }

  // ===== 场景实现：正常履约（完全复用 full-flow） =====
  async function runScenarioNormalFullflow() {
    await handleFullFlow();
  }

  // ===== 场景实现：拣货不足（Under Pick） =====
  async function runScenarioUnderPick() {
    if (!order || !orderFacts) {
      setError("请先加载一笔订单，并确保有行事实。");
      return;
    }

    setActionLoading("full");
    setError(null);

    try {
      // 1）按下单数量做预占
      const reserveLines =
        orderFacts.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_ordered || 1,
        })) || [];

      await reserveOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        lines: reserveLines,
      });

      // 2）只拣一半数量（向下取整，至少 1）
      const pickLines =
        orderFacts.map((f) => {
          const ordered = f.qty_ordered || 0;
          const pickQty = Math.max(1, Math.floor(ordered / 2) || 1);
          return { item_id: f.item_id, qty: pickQty };
        }) || [];

      await pickOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        warehouse_id: order.warehouse_id ?? 1,
        batch_code: "AUTO",
        lines: pickLines,
      });

      // 不发货：让 lifecycle 只看到 reserved / reserved_consumed，不出现 shipped。
      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "拣货不足场景执行失败");
    } finally {
      setActionLoading(null);
    }
  }

  // ===== 场景实现：预占超量（Oversell） =====
  async function runScenarioOversell() {
    if (!order || !orderFacts) {
      setError("请先加载一笔订单，并确保有行事实。");
      return;
    }

    setActionLoading("reserve");
    setError(null);

    try {
      const lines =
        orderFacts.map((f) => ({
          item_id: f.item_id,
          // 预占为下单数量的两倍，测试 anti-oversell & channel 库存约束
          qty: Math.max(1, (f.qty_ordered || 1) * 2),
        })) || [];

      await reserveOrder({
        platform: order.platform,
        shopId: order.shop_id,
        extOrderNo: order.ext_order_no,
        lines,
      });

      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      // 这里很可能抛“库存不足”，直接展示后端真实报错即可
      setError(getErrorMessage(err) ?? "预占超量场景执行失败");
    } finally {
      setActionLoading(null);
    }
  }

  // ===== 场景实现：退货链路（RMA Flow） =====
  async function runScenarioReturnFlow() {
    if (!order || !orderFacts) {
      setError("请先加载一笔订单，并确保有行事实。");
      return;
    }

    setActionLoading("full");
    setError(null);

    try {
      // 1）如果还没发货，先走一遍完整履约（reserve → pick → ship）
      const totalShipped =
        orderFacts.reduce(
          (acc, f) => acc + (f.qty_shipped || 0),
          0,
        ) ?? 0;

      if (totalShipped <= 0) {
        const lines =
          orderFacts.map((f) => ({
            item_id: f.item_id,
            qty: Math.max(1, f.qty_ordered || 1),
          })) || [];

        await reserveOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          lines,
        });

        await pickOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          warehouse_id: order.warehouse_id ?? 1,
          batch_code: "AUTO",
          lines,
        });

        await shipOrder({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          warehouse_id: order.warehouse_id ?? 1,
          lines,
        });

        await confirmShipViaDev({
          platform: order.platform,
          shopId: order.shop_id,
          extOrderNo: order.ext_order_no,
          traceId,
          carrier: undefined,
        });
      }

      // 2）基于剩余可退额度创建 RMA 收货任务（from-order）
      const candidates = orderFacts.filter(
        (f) => f.qty_remaining_refundable > 0,
      );
      if (candidates.length === 0) {
        throw new Error("当前订单没有剩余可退数量。");
      }

      const payload = {
        warehouse_id: order.warehouse_id ?? 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: f.qty_remaining_refundable,
          item_name: f.title ?? null,
          batch_code: null,
        })),
      };

      const task = await createReceiveTaskFromOrder(order.id, payload);

      // 3）刷新一次链路视图
      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");

      // 4）跳转到收货任务详情，方便手工 commit
      navigate(`/receive-tasks/${task.id}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "退货链路场景执行失败");
    } finally {
      setActionLoading(null);
    }
  }

  // ===== 场景入口：供 DevOrderScenariosPanel 调用 =====
  async function handleScenario(scenario: ScenarioType) {
    // 若生命周期已经判为 BAD，则直接拦截（守门逻辑）
    if (forbidScenarios) {
      setError("当前生命周期健康度为 BAD，暂不允许执行调试场景。");
      return;
    }

    switch (scenario) {
      case "normal_fullflow":
        await runScenarioNormalFullflow();
        break;
      case "under_pick":
        await runScenarioUnderPick();
        break;
      case "oversell":
        await runScenarioOversell();
        break;
      case "return_flow":
        await runScenarioReturnFlow();
        break;
      default:
        setError(`未知场景：${String(scenario)}`);
    }
  }

  const isBusy = !!actionLoading || creatingRma || ensuringWarehouse;

  return (
    <DevOrderProvider>
      <div className="space-y-4">
        {/* 顶部工具条 */}
        <div className="flex items-center justify之间 text-xs text-slate-500">
          <span>
            订单 → Ledger → Stock → Trace 全链路调试（DevConsole）
          </span>

          <button
            onClick={handleDemoIngest}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-500"
          >
            生成测试订单（demo ingest）
          </button>
        </div>

        {/* 查询表单 */}
        <form
          onSubmit={handleQuery}
          className="flex flex-wrap items-end gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">platform</label>
            <input
              value={form.platform}
              onChange={onChange("platform")}
              className="mt-1 w-32 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500">shop_id</label>
            <input
              value={form.shopId}
              onChange={onChange("shopId")}
              className="mt-1 w-24 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="flex min-w-[200px] flex-col">
            <label className="text-xs text-gray-500">ext_order_no</label>
            <input
              value={form.extOrderNo}
              onChange={onChange("extOrderNo")}
              className="mt-1 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.extOrderNo.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
          >
            {loading ? "查询中…" : "查询订单 & Trace"}
          </button>
        </form>

        {/* 错误 */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* 主体内容 */}
        {order && (
          <div className="space-y-4 rounded-md border bg-white p-4 shadow-sm">
            <DevOrdersTabs active={activeTab} onChange={setActiveTab} />

            {activeTab === "flow" && (
              <DevOrderFlowPanel
                order={order}
                orderFacts={orderFacts}
                lifecycleStages={lifecycleStages}
                lifecycleSummary={lifecycleSummary}
                lifecycleConsistencyIssues={lifecycleConsistencyIssues}
                lifecycleLoading={lifecycleLoading}
                lifecycleError={lifecycleError}
                traceId={traceId}
                isBusy={isBusy}
                ensuringWarehouse={ensuringWarehouse}
                handleEnsureWarehouse={handleEnsureWarehouse}
                actionLoading={actionLoading}
                handleAction={handleAction}
                handleFullFlow={handleFullFlow}
                reconcileLoading={reconcileLoading}
                handleReconcile={handleReconcile}
                creatingRma={creatingRma}
                handleCreateRmaTask={handleCreateRmaTask}
                hasReserved={hasReserved}
                hasShipped={hasShipped}
                reconcileResult={reconcileResult}
              />
            )}

            {activeTab === "scenarios" && (
              <DevOrderScenariosPanel
                order={order}
                orderFacts={orderFacts}
                isBusy={isBusy}
                forbidScenarios={forbidScenarios}
                onRunScenario={handleScenario}
              />
            )}

            {activeTab === "tools" && <DevOrderToolsPanel />}
          </div>
        )}

        {/* Timeline */}
        {traceEvents.length > 0 && (
          <div className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-800">
              全链路时间线（Lifecycle + Trace）
            </h2>

            <DevOrderTraceCard
              events={traceEvents}
              focusRef={
                order
                  ? `ORD:${order.platform}:${order.shop_id}:${order.ext_order_no}`
                  : null
              }
            />
          </div>
        )}
      </div>
    </DevOrderProvider>
  );
};
