// src/features/dev/DevInboundPanel.tsx
// ================================================================
//  入库链路调试主面板（Inbound Debug Panel v2）
//  - Page 仅负责布局，不负责业务逻辑
//  - 业务逻辑在 useDevInboundController 中实现
//  - UI 由 inbound/ 下的卡片组件组合而成
// ================================================================

import React from "react";
import { useDevInboundController } from "./inbound/useDevInboundController";

import { DevInboundHeader } from "./inbound/DevInboundHeader";
import { DevInboundContextCard } from "./inbound/DevInboundContextCard";
import { DevInboundScanCard } from "./inbound/DevInboundScanCard";
import { DevInboundLinesCard } from "./inbound/DevInboundLinesCard";
import { DevInboundCommitCard } from "./inbound/DevInboundCommitCard";
import { DevInboundPostCommitCard } from "./inbound/DevInboundPostCommitCard";

const DevInboundPanel: React.FC = () => {
  const c = useDevInboundController();

  return (
    <div className="space-y-6">
      {/* Header */}
      <DevInboundHeader />

      {/* 上半区：PO / 任务 / 扫码 */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          <DevInboundContextCard c={c} />
          <DevInboundScanCard c={c} />
        </div>

        {/* 右边：commit + post-commit */}
        <div className="space-y-4">
          <DevInboundCommitCard c={c} />
          <DevInboundPostCommitCard c={c} />
        </div>
      </div>

      {/* 下半区：行明细 */}
      <DevInboundLinesCard c={c} />
    </div>
  );
};

export { DevInboundPanel };
