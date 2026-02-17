// src/features/operations/inbound/InboundCockpitPage.tsx
// =====================================================
//  作业区 · 收货驾驶舱（Inbound Cockpit）
//  - 仓库作业人员使用
//  - 通过 Tab 切分不同收货语义的工作流
//  - ✅ Phase 3：补录（批次/日期）已并入作业流常驻显示，不再使用抽屉/独立页/URL 开关
// =====================================================

import React, { useState } from "react";
import { InboundCockpitHeader } from "./InboundCockpitHeader";
import { useInboundCockpitController } from "./useInboundCockpitController";
import { InboundTabs } from "./InboundTabs";
import type { InboundTabKey } from "./inboundTabs";
import { InboundTabBody } from "./tabs/InboundTabBody";

const InboundCockpitPage: React.FC = () => {
  const c = useInboundCockpitController();

  // ✅ 采购收货已合并扫码能力：默认进入 “采购收货”
  const [tab, setTab] = useState<InboundTabKey>("PURCHASE_MANUAL");

  return (
    <div className="p-7 space-y-6">
      <InboundCockpitHeader />

      <div className="flex items-center justify-between gap-4">
        <InboundTabs value={tab} onChange={setTab} />
      </div>

      <InboundTabBody tab={tab} c={c} />
    </div>
  );
};

export default InboundCockpitPage;
