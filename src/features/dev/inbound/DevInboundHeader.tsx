// src/features/dev/inbound/DevInboundHeader.tsx
// Inbound Debug Panel 头部说明

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

export const DevInboundHeader: React.FC = () => {
  return (
    <div>
      <PageTitle
        title="入库链路调试（Inbound Debug Panel）"
        description="从采购单（PO）到收货任务（receive_task），再到扫码实收与 commit 入库的完整调试面板。用于验证入库链路的端到端正确性，不面向仓库一线操作员。"
      />
      <p className="mt-2 text-xs text-slate-500">
        建议使用本面板做：demo 采购单 → 收货任务 → 扫码 → commit →
        Trace / Ledger / Snapshot 全链路验证。生产作业请使用正式 Inbound Cockpit。
      </p>
    </div>
  );
};
