// src/features/operations/scan/ScanCountSidebar.tsx

import React from "react";

export const ScanCountSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
      <section className="bg-white border border-dashed border-slate-200 rounded-xl p-4 text-xs text-slate-500">
        右侧区域可以后续接入：
        <br />
        - 某个 item 的库存 snapshot；
        <br />- 与本次盘点相关的 Trace 链路；
        <br />
        当前阶段先通过“查看链路 / 查看库存”按钮跳转。
      </section>
    </div>
  );
};
