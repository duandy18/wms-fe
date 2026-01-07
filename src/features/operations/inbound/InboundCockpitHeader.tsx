// src/features/operations/inbound/InboundCockpitHeader.tsx
// 入库 Cockpit 头部

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

export const InboundCockpitHeader: React.FC = () => {
  return (
    <div className="pb-1">
      <PageTitle title="收货" />
    </div>
  );
};
