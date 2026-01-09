// src/features/operations/inbound/return-receive/ReturnReceiveTaskFactsCard.tsx

import React from "react";
import { InboundUI } from "../ui";
import type { ReturnTask } from "./types";

export const ReturnReceiveTaskFactsCard: React.FC<{ task: ReturnTask }> = ({ task }) => {
  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} space-y-2`}>
      <div className="text-base font-semibold text-slate-900">当前任务（只读事实）</div>
      <div className="text-sm text-slate-700">
        任务：#{task.id} · 仓库 {task.warehouse_id} · 状态 {task.status}
      </div>
      <div className={InboundUI.quiet}>批次来自出库台账，系统自动回原批次（不可编辑）。</div>
    </section>
  );
};
