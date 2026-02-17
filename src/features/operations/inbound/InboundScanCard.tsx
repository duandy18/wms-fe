// src/features/operations/inbound/InboundScanCard.tsx
// 收货扫码卡片（面向仓库作业）

import React from "react";
import type { InboundCockpitController } from "./types";
import { useInboundScanCardModel } from "./scan/useInboundScanCardModel";
import { ScanInputCard } from "./scan-work/ScanInputCard";
import { InboundUI } from "./ui";
import { getInboundUiCaps } from "./stateMachine";

interface Props {
  c: InboundCockpitController;
}

export const InboundScanCard: React.FC<Props> = ({ c }) => {
  const m = useInboundScanCardModel(c);

  const caps = getInboundUiCaps({
    currentTask: c.currentTask,
    committing: c.committing,
    manualDraft: c.manualDraft,
    varianceSummary: c.varianceSummary,
  });

  const disabled = !caps.canScan;

  return (
    <div className={InboundUI.cardGap}>
      {!disabled ? null : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700">
          扫码已禁用：{caps.blockedReason ?? "当前状态不允许扫码"}
        </div>
      )}

      <div className={disabled ? "pointer-events-none opacity-60" : ""}>
        <ScanInputCard
          c={c}
          scanQty={m.scanQty}
          onQtyChange={m.handleQtyChange}
          onScan={m.handleScan}
        />
      </div>
    </div>
  );
};
