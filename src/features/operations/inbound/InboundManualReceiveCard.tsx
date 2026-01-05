// src/features/operations/inbound/InboundManualReceiveCard.tsx
// 采购单行收货卡片（手工录入）
// - 只负责录入数量；批次/日期由收货明细行统一编辑
// - 重要：前端不再用“缺批次/缺日期”阻塞流程，最终以服务端 commit 规则为准
//   * 有保质期商品：服务端 commit 会强制批次+日期
//   * 无保质期商品：服务端允许日期为空，批次为空会自动 NOEXP

import React from "react";
import type { InboundCockpitController } from "./types";
import { useInboundManualReceiveModel } from "./manual/useInboundManualReceiveModel";
import { ManualReceiveHeader } from "./manual/ManualReceiveHeader";
import { ManualReceiveTable } from "./manual/ManualReceiveTable";

interface Props {
  c: InboundCockpitController;
}

export const InboundManualReceiveCard: React.FC<Props> = ({ c }) => {
  const m = useInboundManualReceiveModel(c);

  if (!m.task) {
    return (
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">采购单行收货（手工录入）</h2>
        <p className="text-xs text-slate-500">尚未绑定收货任务。请先选择采购单并创建收货任务。</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <ManualReceiveHeader />

      {m.error && <div className="text-[11px] text-red-600">{m.error}</div>}

      <ManualReceiveTable
        lines={m.lines}
        qtyInputs={m.qtyInputs}
        savingItemId={m.savingItemId}
        onQtyChange={m.handleQtyChange}
        onReceive={(line) => void m.handleReceive(line)}
      />
    </section>
  );
};
