// src/features/operations/inbound/InboundTaskContextCard.tsx
// Cockpit 上下文：采购单 / 订单退货 + 收货任务
// - 支持两种模式：
//   * 供应商收货（PO）：从采购单创建收货任务
//   * 订单退货（ORDER）：绑定已有的订单退货收货任务（source_type=ORDER）

import React from "react";
import type { InboundCockpitController } from "./types";
import { InboundModeBar } from "./InboundModeBar";
import { PurchaseOrderContextPanel } from "./purchase-context";
import { ReceiveTaskContextPanel } from "./receive-task";
import { useInboundTaskContextModel } from "./purchase-context";
import { InboundUI } from "./ui";
import { getInboundUiCaps, taskStatusLabel } from "./stateMachine";

interface Props {
  c: InboundCockpitController;
}

export const InboundTaskContextCard: React.FC<Props> = ({ c }) => {
  const po = c.currentPo;
  const task = c.currentTask;

  const m = useInboundTaskContextModel(c);

  const caps = getInboundUiCaps({
    currentTask: c.currentTask,
    committing: c.committing,
    manualDraft: c.manualDraft,
    varianceSummary: c.varianceSummary,
  });

  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className={InboundUI.title}>收货上下文</h2>
          <InboundModeBar mode={m.mode} onChange={m.setMode} />
        </div>

        <div className="text-right space-y-1">
          {c.poError && m.mode === "PO" && <div className={InboundUI.danger}>{c.poError}</div>}
          {c.taskError && <div className={InboundUI.danger}>{c.taskError}</div>}
        </div>
      </div>

      {/* ✅ 状态显性化：把“你现在在哪”钉在 UI 上 */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {task ? (
            <>
              当前任务 <span className="font-mono">#{task.id}</span> · {taskStatusLabel(task)}
              {po ? <span className="ml-2 text-slate-500">（采购单 #{po.id}）</span> : null}
            </>
          ) : (
            <span className="text-slate-500">尚未绑定收货任务</span>
          )}
        </div>

        <div
          className={[
            "shrink-0 rounded-full px-3 py-1 text-[12px] font-medium border",
            caps.isCommitted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200",
          ].join(" ")}
          title={caps.status}
        >
          {caps.isCommitted ? "已入库" : task ? "进行中" : "未开始"}
        </div>
      </div>

      {caps.blockedReason ? <div className="text-[13px] text-slate-600">提示：{caps.blockedReason}</div> : null}

      {m.mode === "PO" ? (
        <div className={InboundUI.cardGap}>
          <PurchaseOrderContextPanel
            c={c}
            po={po}
            poOptions={m.poOptions}
            loadingPoOptions={m.loadingPoOptions}
            poOptionsError={m.poOptionsError}
            selectedPoId={m.selectedPoId}
            onSelectPoId={m.handleSelectPoId}
          />

          <ReceiveTaskContextPanel c={c} mode={m.mode} po={po} task={task} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className={InboundUI.subtitle}>退货收货请从退货任务进入（本页不复用采购收货逻辑）。</div>
          <ReceiveTaskContextPanel c={c} mode={m.mode} po={po} task={task} />
        </div>
      )}
    </section>
  );
};
