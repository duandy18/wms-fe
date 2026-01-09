// src/features/operations/inbound/return-receive/ReturnReceiveCreateTaskCard.tsx

import React from "react";
import { InboundUI } from "../ui";

export const ReturnReceiveCreateTaskCard: React.FC<{
  selectedRef: string;
  canCreate: boolean;
  creating: boolean;
  onCreate: () => void;
  hint?: string;
}> = ({ selectedRef, canCreate, creating, onCreate, hint }) => {
  return (
    <section className={`${InboundUI.card} ${InboundUI.cardPad} ${InboundUI.cardGap}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className={InboundUI.title}>作业入口</h2>
        <span className={InboundUI.quiet}>
          当前：{selectedRef ? <span className="font-mono">{selectedRef}</span> : "未选择"}
        </span>
      </div>

      {hint ? <div className={InboundUI.quiet}>{hint}</div> : null}

      <div className="flex items-center gap-2">
        <button type="button" className={InboundUI.btnPrimary} disabled={!canCreate} onClick={onCreate}>
          {creating ? "创建中…" : "创建退货回仓任务"}
        </button>

        {!selectedRef ? <span className={InboundUI.quiet}>先在左侧选择订单。</span> : null}
      </div>
    </section>
  );
};
