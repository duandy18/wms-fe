// src/features/operations/inbound/InboundTaskContextCard.tsx
// Cockpit 上下文：采购单 / 订单退货 + 收货任务
// - 支持两种模式：
//   * 供应商收货（PO）：从采购单创建收货任务
//   * 订单退货（ORDER）：绑定已有的订单退货收货任务（source_type=ORDER）

import React from "react";
import type { InboundCockpitController } from "./types";
import { InboundModeBar } from "./InboundModeBar";
import { PurchaseOrderContextPanel } from "./PurchaseOrderContextPanel";
import { ReceiveTaskContextPanel } from "./ReceiveTaskContextPanel";
import { useInboundTaskContextModel } from "./task-context/useInboundTaskContextModel";

interface Props {
  c: InboundCockpitController;
}

export const InboundTaskContextCard: React.FC<Props> = ({ c }) => {
  const po = c.currentPo;
  const task = c.currentTask;

  const m = useInboundTaskContextModel(c);

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-slate-800">收货上下文</h2>
          <InboundModeBar mode={m.mode} onChange={m.setMode} />
        </div>

        <div className="text-right space-y-1">
          {c.poError && m.mode === "PO" && (
            <div className="text-xs text-red-600">{c.poError}</div>
          )}
          {c.taskError && <div className="text-xs text-red-600">{c.taskError}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-4 text-sm">
        <div className="space-y-2">
          {m.mode === "PO" ? (
            <PurchaseOrderContextPanel
              c={c}
              po={po}
              poOptions={m.poOptions}
              loadingPoOptions={m.loadingPoOptions}
              poOptionsError={m.poOptionsError}
              selectedPoId={m.selectedPoId}
              onSelectPo={m.handleSelectPo}
              onManualLoadPo={m.handleManualLoadPo}
            />
          ) : (
            <div className="text-xs text-slate-500">退货收货</div>
          )}
        </div>

        <ReceiveTaskContextPanel c={c} mode={m.mode} po={po} task={task} />
      </div>
    </section>
  );
};
