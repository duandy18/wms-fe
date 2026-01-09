// src/features/operations/inbound/tabs/InboundTabBody.tsx

import React from "react";
import type { InboundTabKey } from "../inboundTabs";
import type { InboundCockpitController } from "../types";
import { PurchaseManualTab } from "./PurchaseManualTab";
import { ReturnReceiveTab } from "./ReturnReceiveTab";

export const InboundTabBody: React.FC<{
  tab: InboundTabKey;
  c: InboundCockpitController;
}> = ({ tab, c }) => {
  switch (tab) {
    case "PURCHASE_MANUAL":
      return <PurchaseManualTab c={c} />;

    case "RETURN":
      // 退货回仓已是独立作业台，不再依赖 InboundCockpitController
      return <ReturnReceiveTab />;

    default:
      return <PurchaseManualTab c={c} />;
  }
};
