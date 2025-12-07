// src/features/operations/scan/ScanPickSidebar.tsx

import React from "react";

export const ScanPickSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
      <section className="bg-white border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        右侧区域后续可以接入：
        <br />
        - 当前 item 的库存视图；
        <br />
        - 与本次拣货相关的 Trace 概览。
        <br />
        当前阶段先通过“查看链路 / 查看库存”按钮跳转。
      </section>
    </div>
  );
};
