// src/features/operations/inbound/InboundCockpitPage.tsx
// =====================================================
//  作业区 · 收货驾驶舱（Inbound Cockpit）
//  - 仓库作业人员使用
//  - 左：任务上下文 + 行明细
//  - 右：扫码收货 + 采购单行收货 + 提交入库
// =====================================================

import React from "react";
import { InboundCockpitHeader } from "./InboundCockpitHeader";
import { useInboundCockpitController } from "./useInboundCockpitController";
import { InboundTaskContextCard } from "./InboundTaskContextCard";
import { InboundScanCard } from "./InboundScanCard";
import { InboundLinesCard } from "./InboundLinesCard";
import { InboundCommitCard } from "./InboundCommitCard";
import { InboundManualReceiveCard } from "./InboundManualReceiveCard";

const InboundCockpitPage: React.FC = () => {
  const c = useInboundCockpitController();

  return (
    <div className="p-6 space-y-6">
      <InboundCockpitHeader />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          <InboundTaskContextCard c={c} />
          <InboundLinesCard c={c} />
        </div>
        <div className="space-y-4">
          <InboundScanCard c={c} />
          <InboundManualReceiveCard c={c} />
          <InboundCommitCard c={c} />
        </div>
      </div>
    </div>
  );
};

export default InboundCockpitPage;
