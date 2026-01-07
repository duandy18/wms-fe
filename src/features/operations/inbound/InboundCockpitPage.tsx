// src/features/operations/inbound/InboundCockpitPage.tsx
// =====================================================
//  作业区 · 收货驾驶舱（Inbound Cockpit）
//  - 仓库作业人员使用
//  - 通过 Tab 切分不同收货语义的工作流
//  - 补录（批次/日期）以抽屉形式嵌入，不作为顶级 Tab
// =====================================================

import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InboundCockpitHeader } from "./InboundCockpitHeader";
import { useInboundCockpitController } from "./useInboundCockpitController";
import { InboundTabs } from "./InboundTabs";
import type { InboundTabKey } from "./inboundTabs";
import { InboundTabBody } from "./tabs/InboundTabBody";
import { InboundSupplementDrawer } from "./InboundSupplementDrawer";
import type { SupplementSourceType } from "./ReceiveSupplementPanel";

function normalizeSourceParam(v: string | null): SupplementSourceType {
  const x = (v ?? "").trim().toLowerCase();
  if (x === "return") return "RETURN";
  if (x === "misc") return "MISC";
  return "PURCHASE";
}

const InboundCockpitPage: React.FC = () => {
  const c = useInboundCockpitController();

  // ✅ 采购收货已合并扫码能力：默认进入 “采购收货”
  const [tab, setTab] = useState<InboundTabKey>("PURCHASE_MANUAL");

  const [sp, setSp] = useSearchParams();

  const drawerOpen = sp.get("supplement") === "1";
  const drawerSource = useMemo(() => normalizeSourceParam(sp.get("source")), [sp]);

  const openDrawer = (source: "purchase" | "return" | "misc") => {
    const next = new URLSearchParams(sp);
    next.set("supplement", "1");
    next.set("source", source);
    setSp(next);
  };

  const closeDrawer = () => {
    const next = new URLSearchParams(sp);
    next.delete("supplement");
    next.delete("source");
    setSp(next);
  };

  return (
    <div className="p-6 space-y-6">
      <InboundCockpitHeader />

      <div className="flex items-center justify-between gap-4">
        <InboundTabs value={tab} onChange={setTab} />

        <button
          type="button"
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          onClick={() => openDrawer("purchase")}
        >
          补录
        </button>
      </div>

      <InboundTabBody tab={tab} c={c} />

      <InboundSupplementDrawer
        open={drawerOpen}
        initialSourceType={drawerSource}
        onClose={closeDrawer}
      />
    </div>
  );
};

export default InboundCockpitPage;
