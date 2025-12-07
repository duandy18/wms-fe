// src/features/dev/count/DevCountHeader.tsx
// Count Debug Panel 头部

import React from "react";
import PageTitle from "../../../components/ui/PageTitle";

export const DevCountHeader: React.FC = () => {
  return (
    <div>
      <PageTitle
        title="盘点链路调试（Count Debug Panel）"
        description="通过 /scan(mode='count') 对某个 item + 仓库执行盘点（绝对量），用于验证盘点台账与库存行为。"
      />
      <p className="mt-2 text-xs text-slate-500">
        本面板用于开发 / 调试盘点逻辑，不面向仓库一线操作人员。生产环境请使用 Count Cockpit。
      </p>
    </div>
  );
};
