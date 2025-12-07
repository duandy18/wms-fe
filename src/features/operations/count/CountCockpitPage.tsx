// src/features/operations/count/CountCockpitPage.tsx
// =====================================================
//  作业区 · 盘点驾驶舱（Count Cockpit）
// =====================================================

import React from "react";
import { CountCockpitHeader } from "./CountCockpitHeader";
import { useCountCockpitController } from "./useCountCockpitController";
import { CountCockpitFormCard } from "./CountCockpitFormCard";
import { CountCockpitResultCard } from "./CountCockpitResultCard";
import { CountCockpitHistoryCard } from "./CountCockpitHistoryCard";

const CountCockpitPage: React.FC = () => {
  const c = useCountCockpitController();

  return (
    <div className="p-6 space-y-6">
      <CountCockpitHeader />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 items-start">
        <CountCockpitFormCard c={c} />
        <div className="space-y-4">
          <CountCockpitResultCard c={c} />
          <CountCockpitHistoryCard c={c} />
        </div>
      </div>
    </div>
  );
};

export default CountCockpitPage;
