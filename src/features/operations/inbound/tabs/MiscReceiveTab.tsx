// src/features/operations/inbound/tabs/MiscReceiveTab.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";
import { InboundManualReceiveCard } from "../InboundManualReceiveCard";
import { InboundCommitCard } from "../InboundCommitCard";

export const MiscReceiveTab: React.FC<{ c: InboundCockpitController }> = ({
  c,
}) => {
  const left = (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-slate-800">收货上下文</h2>
        <div className="mt-2 text-sm text-slate-600">
          当前入口：样品 / 非采购收货
        </div>
      </section>
    </div>
  );

  const right = (
    <div className="space-y-4">
      <InboundManualReceiveCard c={c} />
      <InboundCommitCard c={c} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
