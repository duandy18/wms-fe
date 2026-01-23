// src/features/dev/orders/DevOrdersPanel.tsx
import React from "react";

import { DevOrderProvider } from "./DevOrderContext";
import { DevOrdersTabs } from "./DevOrdersTabs";
import { DevOrderFlowPanel } from "./DevOrderFlowPanel";
import { DevOrderScenariosPanel } from "./DevOrderScenariosPanel";
import { DevOrderToolsPanel } from "./DevOrderToolsPanel";
import { DevOrderTraceCard } from "./DevOrderTraceCard";

import { useDevOrdersController } from "./controller";

export type ScenarioType = "normal_fullflow" | "under_pick" | "oversell" | "return_flow";

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

export const DevOrdersPanel: React.FC<Props> = (props) => {
  const c = useDevOrdersController(props);

  return (
    <DevOrderProvider>
      <div className="space-y-4">
        {/* 顶部工具条 */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>订单 → Ledger → Stock → Trace 全链路调试（DevConsole）</span>
          <button
            onClick={() => void c.handleDemoIngest()}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-500"
          >
            生成测试订单（demo ingest）
          </button>
        </div>

        {/* 查询表单 */}
        <form
          onSubmit={(e) => void c.handleQuery(e)}
          className="flex flex-wrap items-end gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">platform</label>
            <input
              value={c.form.platform}
              onChange={c.onChange("platform")}
              className="mt-1 w-32 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-gray-500">shop_id</label>
            <input
              value={c.form.shopId}
              onChange={c.onChange("shopId")}
              className="mt-1 w-24 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <div className="flex min-w-[200px] flex-col">
            <label className="text-xs text-gray-500">ext_order_no</label>
            <input
              value={c.form.extOrderNo}
              onChange={c.onChange("extOrderNo")}
              className="mt-1 rounded-md border px-2 py-1 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={c.loading || !c.form.extOrderNo.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm disabled:opacity-60"
          >
            {c.loading ? "查询中…" : "查询订单 & Trace"}
          </button>
        </form>

        {/* 错误 */}
        {c.error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{c.error}</div>
        )}

        {/* 主体内容 */}
        {c.order && (
          <div className="space-y-4 rounded-md border bg-white p-4 shadow-sm">
            <DevOrdersTabs active={c.activeTab} onChange={c.setActiveTab} />

            {c.activeTab === "flow" && (
              <DevOrderFlowPanel
                order={c.order}
                orderFacts={c.orderFacts}
                lifecycleStages={c.lifecycle.stages}
                lifecycleSummary={c.lifecycle.summary}
                lifecycleConsistencyIssues={c.lifecycle.consistencyIssues}
                lifecycleLoading={c.lifecycle.loading}
                lifecycleError={c.lifecycle.error}
                traceId={c.traceId}
                isBusy={c.isBusy}
                ensuringWarehouse={c.ensuringWarehouse}
                handleEnsureWarehouse={() => void c.handleEnsureWarehouse()}
                actionLoading={c.actionLoading}
                handleAction={(t) => void c.handleAction(t)}
                handleFullFlow={() => void c.handleFullFlow()}
                reconcileLoading={c.reconcileLoading}
                handleReconcile={() => void c.handleReconcile()}
                reconcileResult={c.reconcileResult}
                creatingRma={c.creatingRma}
                handleCreateRmaTask={() => void c.handleCreateRmaTask()}
                hasReserved={c.lifecycle.hasReserved}
                hasShipped={c.lifecycle.hasShipped}
              />
            )}

            {c.activeTab === "scenarios" && (
              <DevOrderScenariosPanel
                order={c.order}
                orderFacts={c.orderFacts}
                isBusy={c.isBusy}
                forbidScenarios={c.lifecycle.forbidScenarios}
                onRunScenario={(s) => void c.handleScenario(s as ScenarioType)}
              />
            )}

            {c.activeTab === "tools" && <DevOrderToolsPanel />}
          </div>
        )}

        {/* Timeline */}
        {c.traceEvents.length > 0 && (
          <div className="space-y-3 rounded-md border bg-white p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-slate-800">全链路时间线（Lifecycle + Trace）</h2>
            <DevOrderTraceCard
              events={c.traceEvents}
              focusRef={c.order ? `ORD:${c.order.platform}:${c.order.shop_id}:${c.order.ext_order_no}` : null}
            />
          </div>
        )}
      </div>
    </DevOrderProvider>
  );
};
