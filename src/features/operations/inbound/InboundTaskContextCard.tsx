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

interface Props {
  c: InboundCockpitController;
}

export const InboundTaskContextCard: React.FC<Props> = ({ c }) => {
  const po = c.currentPo;
  const task = c.currentTask;

  const m = useInboundTaskContextModel(c);

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
