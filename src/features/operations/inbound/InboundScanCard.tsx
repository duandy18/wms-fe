// src/features/operations/inbound/InboundScanCard.tsx
// 收货扫码卡片（面向仓库作业）
// 原则：不做业务解释系统，只呈现 状态 / 数量 / 结果 / 错误

import React from "react";
import type { InboundCockpitController } from "./types";
import { useInboundScanCardModel } from "./scan/useInboundScanCardModel";
import { ScanInputCard } from "./scan-work/ScanInputCard";
import { ScanResultCard } from "./scan-work/ScanResultCard";
import { ScanHistoryCard } from "./scan-work/ScanHistoryCard";

interface Props {
  c: InboundCockpitController;
}

export const InboundScanCard: React.FC<Props> = ({ c }) => {
  const m = useInboundScanCardModel(c);

  return (
    <div className="space-y-4">
      <ScanInputCard
        c={c}
        scanQty={m.scanQty}
        onQtyChange={m.handleQtyChange}
        onScan={m.handleScan}
      />

      <ScanResultCard
        c={c}
        loading={m.loading}
        probeError={m.probeError}
        statusLevel={m.statusLevel}
        statusMsg={m.statusMsg}
      />

      <ScanHistoryCard c={c} limit={10} />
    </div>
  );
};
