// src/features/operations/inbound/InboundCockpitPage.tsx
// =====================================================
//  作业区 · 收货驾驶舱（Inbound Cockpit）
//  - 仓库作业人员使用
//  - 左：任务上下文 + 行明细
//  - 右：扫码收货 + 采购单行收货 + 提交入库
// =====================================================

import React, { useMemo, useState } from "react";
import { InboundCockpitHeader } from "./InboundCockpitHeader";
import { useInboundCockpitController } from "./useInboundCockpitController";
import { InboundTaskContextCard } from "./InboundTaskContextCard";
import { InboundScanCard } from "./InboundScanCard";
import { InboundLinesCard } from "./InboundLinesCard";
import { InboundCommitCard } from "./InboundCommitCard";
import { InboundManualReceiveCard } from "./InboundManualReceiveCard";
import { InboundTabs } from "./InboundTabs";
import type { InboundTabKey } from "./inboundTabs";

const InboundCockpitPage: React.FC = () => {
  const c = useInboundCockpitController();

  const [tab, setTab] = useState<InboundTabKey>("PURCHASE_SCAN");

  const showTaskContext = tab !== "MISC";
  const showLines = tab !== "MISC";

  const showScan = useMemo(() => {
    if (tab === "PURCHASE_SCAN") return true;
    if (tab === "RETURN") return true;
    return false;
  }, [tab]);

  const showManual = useMemo(() => {
    if (tab === "PURCHASE_MANUAL") return true;
    if (tab === "RETURN") return true;
    if (tab === "MISC") return true;
    return false;
  }, [tab]);

  const left = (
    <div className="space-y-4">
      {showTaskContext ? <InboundTaskContextCard c={c} /> : null}
      {showLines ? <InboundLinesCard c={c} /> : null}

      {!showTaskContext && (
        <section className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-800">收货上下文</h2>
          <div className="mt-2 text-sm text-slate-600">
            当前入口：样品 / 非采购收货
          </div>
        </section>
      )}
    </div>
  );

  const right = (
    <div className="space-y-4">
      {showScan ? <InboundScanCard c={c} /> : null}
      {showManual ? <InboundManualReceiveCard c={c} /> : null}
      <InboundCommitCard c={c} />
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <InboundCockpitHeader />

      <div className="flex items-center justify-between gap-4">
        <InboundTabs value={tab} onChange={setTab} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        {left}
        {right}
      </div>
    </div>
  );
};

export default InboundCockpitPage;
