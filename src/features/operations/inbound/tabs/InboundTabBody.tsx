// src/features/operations/inbound/tabs/InboundTabBody.tsx

import React from "react";
import type { InboundTabKey } from "../inboundTabs";
import type { InboundCockpitController } from "../types";
import { PurchaseScanTab } from "./PurchaseScanTab";
import { PurchaseManualTab } from "./PurchaseManualTab";
import { ReturnReceiveTab } from "./ReturnReceiveTab";
import { MiscReceiveTab } from "./MiscReceiveTab";

export const InboundTabBody: React.FC<{
  tab: InboundTabKey;
  c: InboundCockpitController;
}> = ({ tab, c }) => {
  switch (tab) {
    case "PURCHASE_SCAN":
      return <PurchaseScanTab c={c} />;
    case "PURCHASE_MANUAL":
      return <PurchaseManualTab c={c} />;
    case "RETURN":
      return <ReturnReceiveTab c={c} />;
    case "MISC":
      return <MiscReceiveTab c={c} />;
    default:
      return <PurchaseScanTab c={c} />;
  }
};
