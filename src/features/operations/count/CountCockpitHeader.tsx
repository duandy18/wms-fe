// src/features/operations/count/CountCockpitHeader.tsx
// 盘点 Cockpit 头部

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

export const CountCockpitHeader: React.FC = () => {
  return (
    <div>
      <PageTitle
        title="盘点驾驶舱（Count Cockpit）"
        description="直接输入盘点后的“目标库存量”，由系统计算差额并写入台账。"
      />
      <p className="mt-2 text-xs text-slate-500">
        本页面面向仓库盘点作业：以 item + 仓库 + 批次 为粒度，将盘点后的绝对量写入台账。
        执行成功后，可以在 Ledger / Snapshot 中看到结果。
      </p>
    </div>
  );
};
