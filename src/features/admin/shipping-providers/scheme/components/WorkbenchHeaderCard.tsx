// src/features/admin/shipping-providers/scheme/components/WorkbenchHeaderCard.tsx

import React from "react";
import { UI } from "../ui";

export const WorkbenchHeaderCard: React.FC<{
  schemeId: number | null;
  loading?: boolean;
  mutating?: boolean;
  summary: { id: number; name: string } | null;
  onBack: () => void;
}> = ({ schemeId, loading, mutating, summary, onBack }) => {
  const titleText = summary ? `#${summary.id} · ${summary.name}` : schemeId ? `#${schemeId} · （加载中）` : "—";

  return (
    <div className={UI.card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={UI.workbenchTitle}>运价方案维护</div>

          <div className={UI.workbenchSubtitle}>{titleText}</div>
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
