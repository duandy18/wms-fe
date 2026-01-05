// src/features/operations/inbound/tabs/PurchaseScanTab.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";
import { InboundTaskContextCard } from "../InboundTaskContextCard";
import { InboundLinesCard } from "../InboundLinesCard";
import { InboundScanCard } from "../InboundScanCard";
import { InboundCommitCard } from "../InboundCommitCard";

export const PurchaseScanTab: React.FC<{ c: InboundCockpitController }> = ({
  c,
}) => {
  const left = (
    <div className="space-y-4">
      <InboundTaskContextCard c={c} />
      <InboundLinesCard c={c} metaMode="hint" />
    </div>
  );

  const right = (
    <div className="space-y-4">
      <InboundScanCard c={c} />
      <InboundCommitCard c={c} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
