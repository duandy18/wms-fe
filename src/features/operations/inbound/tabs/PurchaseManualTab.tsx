// src/features/operations/inbound/tabs/PurchaseManualTab.tsx

import React from "react";
import type { InboundCockpitController } from "../types";
import { InboundTabShell } from "./InboundTabShell";
import { InboundTaskContextCard } from "../InboundTaskContextCard";
import { InboundLinesCard } from "../InboundLinesCard";
import { InboundManualReceiveCard } from "../InboundManualReceiveCard";
import { InboundCommitCard } from "../InboundCommitCard";

export const PurchaseManualTab: React.FC<{ c: InboundCockpitController }> = ({
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
      <InboundManualReceiveCard c={c} />
      <InboundCommitCard c={c} />
    </div>
  );

  return <InboundTabShell left={left} right={right} />;
};
