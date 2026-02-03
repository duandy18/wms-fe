// src/features/dev/orders/DevOrderFlowPanel.tsx
import React from "react";
import { DevOrderHeaderCard } from "./DevOrderHeaderCard";
import { DevOrderActionsCard } from "./DevOrderActionsCard";
import { DevOrderFactsCard } from "./DevOrderFactsCard";
import { DevOrderLifecycleCard } from "./DevOrderLifecycleCard";
import type {
  DevOrderInfo,
  DevOrderItemFact,
  DevOrderReconcileResult,
  OrderLifecycleStageV2,
  OrderLifecycleSummaryV2,
} from "./api/index";

export const DevOrderFlowPanel: React.FC<{
  order: DevOrderInfo;
  orderFacts: DevOrderItemFact[] | null;

  lifecycleStages: OrderLifecycleStageV2[];
  lifecycleSummary: OrderLifecycleSummaryV2 | null;
  lifecycleConsistencyIssues: string[];
  lifecycleLoading: boolean;
  lifecycleError: string | null;

  traceId: string | null;

  isBusy: boolean;

  ensuringWarehouse: boolean;
  handleEnsureWarehouse: () => void;

  actionLoading: null | "pick" | "ship" | "full";
  handleAction: (t: "pick" | "ship") => void;
  handleFullFlow: () => void;

  reconcileLoading: boolean;
  handleReconcile: () => void;
  reconcileResult: DevOrderReconcileResult | null;

  creatingRma: boolean;
  handleCreateRmaTask: () => void;

  hasShipped: boolean;
}> = (props) => {
  const {
    order,
    orderFacts,
    lifecycleStages,
    lifecycleSummary,
    lifecycleConsistencyIssues,
    lifecycleLoading,
    lifecycleError,
    traceId,
    isBusy,
    ensuringWarehouse,
    handleEnsureWarehouse,
    actionLoading,
    handleAction,
    handleFullFlow,
    reconcileLoading,
    handleReconcile,
    reconcileResult,
    creatingRma,
    handleCreateRmaTask,
    hasShipped,
  } = props;

  return (
    <div className="space-y-4">
      {/* 订单头 */}
      <DevOrderHeaderCard
        order={order}
        orderFacts={orderFacts}
        traceId={traceId}
        orderRef={null}
        onViewLedger={() => {}}
        onViewStock={() => {}}
        onViewOrderLifecycle={() => {}}
        onViewLedgerCockpit={() => {}}
      />

      {/* 仓库未解析提示 */}
      {order.warehouse_id == null && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-2 text-[11px] text-amber-800">
          当前订单未解析仓库。
          <button
            onClick={handleEnsureWarehouse}
            disabled={ensuringWarehouse}
            className="ml-2 rounded border border-amber-300 px-2 py-0.5 text-[11px]"
          >
            {ensuringWarehouse ? "解析中…" : "按店铺绑定解析仓库"}
          </button>
        </div>
      )}

      {/* 生命周期卡片（纯展示） */}
      <DevOrderLifecycleCard
        traceId={traceId}
        stages={lifecycleStages}
        summary={lifecycleSummary}
        consistencyIssues={lifecycleConsistencyIssues}
        loading={lifecycleLoading}
        error={lifecycleError}
      />

      {/* 动作按钮 */}
      <DevOrderActionsCard
        isBusy={isBusy}
        actionLoading={actionLoading}
        onAction={handleAction}
        onFullFlow={handleFullFlow}
        hasShipped={hasShipped}
      />

      {/* 行事实 + 对账 + RMA */}
      <DevOrderFactsCard
        orderFacts={orderFacts}
        reconcileResult={reconcileResult}
        reconcileLoading={reconcileLoading}
        creatingRma={creatingRma}
        onReconcile={handleReconcile}
        onCreateRmaTask={handleCreateRmaTask}
      />
    </div>
  );
};
