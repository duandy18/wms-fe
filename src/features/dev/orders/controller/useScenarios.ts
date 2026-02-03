// src/features/dev/orders/controller/useScenarios.ts
import type { ScenarioType } from "../DevOrdersPanel";

// -----------------------------
// 最小输入形状（彻底解耦：不依赖 ../api 的类型）
// -----------------------------

type OrderLike = {
  id: number;
  platform: string;
  shop_id: string;
  ext_order_no: string;
  warehouse_id?: number | null;
};

type OrderFactLike = {
  item_id: number;
  qty_ordered?: number | null;
  qty_shipped?: number | null;
  qty_remaining_refundable?: number | null;
  title?: string | null;
};

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

export function useScenarios(args: {
  order: OrderLike | null;
  orderFacts: OrderFactLike[] | null;
  traceId: string | null;

  // 控制器提供的动作/工具（全部通过注入调用）
  setError: (msg: string | null) => void;
  setActionLoading: (v: null | "pick" | "ship" | "full") => void;
  setActiveTab: (t: "flow" | "scenarios" | "tools") => void;

  loadOrderAndTrace: () => Promise<void>;
  refetchLifecycle: () => void;

  pickOrder: (p: {
    platform: string;
    shopId: string;
    extOrderNo: string;
    warehouse_id: number;
    batch_code: string;
    lines: LinesPayload;
  }) => Promise<unknown>;
  shipOrder: (p: { platform: string; shopId: string; extOrderNo: string; warehouse_id: number; lines: LinesPayload }) => Promise<unknown>;
  confirmShipViaDev: (p: { platform: string; shopId: string; extOrderNo: string; carrier?: string; traceId?: string | null }) => Promise<unknown>;

  // 复用“正常履约”全链路
  handleFullFlow: () => Promise<void>;

  // RMA（注入）
  createReceiveTaskFromOrder: (orderId: number, payload: RmaFromOrderPayload) => Promise<unknown>;

  getErrorMessage: (e: unknown) => string;
}) {
  const {
    order,
    orderFacts,
    traceId,
    setError,
    setActionLoading,
    setActiveTab,
    loadOrderAndTrace,
    refetchLifecycle,
    pickOrder,
    shipOrder,
    confirmShipViaDev,
    handleFullFlow,
    createReceiveTaskFromOrder,
    getErrorMessage,
  } = args;

  function ensureFacts(): OrderFactLike[] | null {
    if (!orderFacts || orderFacts.length === 0) return null;
    return orderFacts;
  }

  async function runScenarioNormalFullflow() {
    await handleFullFlow();
  }

  async function runScenarioReturnFlow() {
    const facts = ensureFacts();
    if (!order || !facts) {
      setError("请先加载一笔订单，并确保有行事实。");
      return;
    }

    setActionLoading("full");
    setError(null);

    try {
      const totalShipped = facts.reduce((acc, f) => acc + (f.qty_shipped || 0), 0) ?? 0;

      // 1) 若未发货，先走一遍履约（pick → ship → confirm）
      if (totalShipped <= 0) {
        const lines: LinesPayload = facts.map((f) => ({
          item_id: f.item_id,
          qty: Math.max(1, f.qty_ordered || 1),
        }));

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

      // 2) 基于剩余可退额度创建 RMA
      const candidates = facts.filter((f) => (f.qty_remaining_refundable || 0) > 0);
      if (candidates.length === 0) {
        throw new Error("当前订单没有剩余可退数量。");
      }

      const payload: RmaFromOrderPayload = {
        warehouse_id: order.warehouse_id ?? 1,
        lines: candidates.map((f) => ({
          item_id: f.item_id,
          qty: Math.max(1, f.qty_remaining_refundable || 0),
          item_name: f.title ?? null,
          batch_code: null,
        })),
      };

      await createReceiveTaskFromOrder(order.id, payload);

      await loadOrderAndTrace();
      refetchLifecycle();
      setActiveTab("flow");
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "退货链路场景执行失败");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleScenario(s: ScenarioType) {
    // 历史场景已下线：不再提供相关按钮，但为了兼容旧 key，这里给出明确提示
    if (s === "under_pick" || s === "oversell") {
      setError("该调试场景已下线（旧流程已清退）。");
      return;
    }

    switch (s) {
      case "normal_fullflow":
        await runScenarioNormalFullflow();
        return;
      case "return_flow":
        await runScenarioReturnFlow();
        return;
      default:
        setError(`未知场景：${String(s)}`);
    }
  }

  return { handleScenario };
}
