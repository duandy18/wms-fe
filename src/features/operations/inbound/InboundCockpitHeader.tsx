// src/features/operations/inbound/InboundCockpitHeader.tsx
// 入库 Cockpit 头部

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

export const InboundCockpitHeader: React.FC = () => {
  return (
    <div>
      <PageTitle
        title="收货驾驶舱（Inbound Cockpit）"
        description="仓库作业入口：从采购单创建收货任务，扫码收货，检查差异并确认入库。"
      />
      <p className="mt-2 text-xs text-slate-500">
        本页面面向仓库作业人员：左侧选择/创建收货任务，右侧完成扫码收货与差异检查，最后点击确认入库。
      </p>
    </div>
  );
};
