// src/features/admin/shipping-providers/scheme/components/WorkbenchHeaderCard.tsx

import React, { useMemo } from "react";
import { UI } from "../ui";

function buildHeaderTitle(args: { providerName?: string | null; schemeName?: string | null }): string {
  const providerName = (args.providerName ?? "").trim();
  const schemeName = (args.schemeName ?? "").trim();

  const parts = [providerName, schemeName].filter(Boolean);
  if (parts.length === 0) return "收费价格设置和维护";

  return `${parts.join("｜")}｜收费价格设置和维护`;
}

function buildBreadcrumb(args: { providerName?: string | null; schemeName?: string | null }): string | null {
  const providerName = (args.providerName ?? "").trim();
  const schemeName = (args.schemeName ?? "").trim();
  if (!providerName && !schemeName) return null;

  const parts = ["主数据", "快递网点"];
  if (providerName) parts.push(providerName);
  parts.push("收费标准");
  if (schemeName) parts.push(schemeName);
  parts.push("工作台");
  return parts.join(" / ");
}

export const WorkbenchHeaderCard: React.FC<{
  schemeId: number | null;
  loading?: boolean;
  mutating?: boolean;
  summary: { id: number; name: string } | null;
  providerName?: string | null;

  onBack: () => void;
}> = ({ loading, mutating, summary, providerName, onBack }) => {
  const schemeName = summary?.name ?? null;

  const title = useMemo(() => {
    return buildHeaderTitle({ providerName, schemeName });
  }, [providerName, schemeName]);

  const breadcrumb = useMemo(() => {
    return buildBreadcrumb({ providerName, schemeName });
  }, [providerName, schemeName]);

  return (
    <div className={UI.card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={UI.workbenchTitle}>{title}</div>
          {breadcrumb ? <div className={UI.workbenchSubtitle}>{breadcrumb}</div> : null}
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
