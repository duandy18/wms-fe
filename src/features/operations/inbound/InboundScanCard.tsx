// src/features/operations/inbound/InboundScanCard.tsx
// 收货扫码卡片（面向仓库作业）

import React from "react";
import type { InboundCockpitController } from "./types";
import { useInboundScanCardModel } from "./scan/useInboundScanCardModel";
import { ScanInputCard } from "./scan-work/ScanInputCard";

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
    </div>
  );
};
