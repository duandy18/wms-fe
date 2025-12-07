// src/features/dev/DevCountPanel.tsx
// =====================================================
//  DevConsole · Count Debug Panel
//  - Page 只做布局
//  - 中控：useDevCountController
//  - 卡片：Header + Form + Result + History
// =====================================================

import React from "react";
import { useDevCountController } from "./count/useDevCountController";
import { DevCountHeader } from "./count/DevCountHeader";
import { DevCountFormCard } from "./count/DevCountFormCard";
import { DevCountResultCard } from "./count/DevCountResultCard";
import { DevCountHistoryCard } from "./count/DevCountHistoryCard";

export const DevCountPanel: React.FC = () => {
  const c = useDevCountController();

  return (
    <div className="space-y-6">
      <DevCountHeader />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <DevCountFormCard c={c} />
        <div className="space-y-4">
          <DevCountResultCard c={c} />
          <DevCountHistoryCard c={c} />
        </div>
      </div>
    </div>
  );
};
