// src/features/admin/shipping-providers/scheme/components/WorkbenchHeaderCard.tsx

import React, { useMemo } from "react";
import { UI } from "../ui";

function buildHeaderTitle(args: { schemeName?: string | null }): string {
  const schemeName = (args.schemeName ?? "").trim();
  if (schemeName) return schemeName;
  return "收费标准工作台";
}

export const WorkbenchHeaderCard: React.FC<{
  schemeId: number | null;
  loading?: boolean;
  mutating?: boolean;
  summary: { id: number; name: string } | null;
  providerName?: string | null;

  onBack: () => void;
}> = ({ loading, mutating, summary, onBack }) => {
  const schemeName = summary?.name ?? null;

  const title = useMemo(() => {
    return buildHeaderTitle({ schemeName });
  }, [schemeName]);

  return (
    <div className={UI.card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={`${UI.workbenchTitle} truncate`} title={title}>
            {title}
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
