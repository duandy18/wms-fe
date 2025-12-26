// src/features/admin/shipping-providers/scheme/components/WorkbenchHeaderCard.tsx

import React from "react";
import { UI } from "../ui";
import { pricingModeLabel } from "../types";

export const WorkbenchHeaderCard: React.FC<{
  schemeId: number | null;
  loading?: boolean;
  mutating?: boolean;
  summary: { id: number; name: string; default_pricing_mode?: string } | null;
  onBack: () => void;
}> = ({ schemeId, loading, mutating, summary, onBack }) => {
  const titleText = summary ? `#${summary.id} · ${summary.name}` : schemeId ? `#${schemeId} · （加载中）` : "—";

  return (
    <div className={UI.card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={UI.workbenchTitle}>运价方案维护（Workbench）</div>

          <div className={UI.workbenchSubtitle}>{titleText}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-1">
              默认口径：
              <span className="ml-2 font-mono text-slate-800">
                {pricingModeLabel(summary?.default_pricing_mode)}
              </span>
            </span>
          </div>
        </div>

        <div className={UI.workbenchHeaderActions}>
          <button type="button" className={UI.workbenchBackBtn} onClick={onBack}>
            返回
          </button>
        </div>
      </div>

      {loading || mutating ? (
        <div className="mt-3 text-sm text-slate-500">
          {loading ? "正在加载方案数据…" : null}
          {mutating ? "正在提交变更…" : null}
        </div>
      ) : null}
    </div>
  );
};

export default WorkbenchHeaderCard;
