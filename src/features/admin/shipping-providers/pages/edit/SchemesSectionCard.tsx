// src/features/admin/shipping-providers/pages/edit/SchemesSectionCard.tsx
import React, { useMemo } from "react";
import { UI } from "../../ui";
import type { PricingScheme } from "../../api/types";
import { SchemeCreateBar } from "./schemes/SchemeCreateBar";
import { SchemesTable } from "./schemes/SchemesTable";
import { useSchemesSectionModel } from "./schemes/useSchemesSectionModel";

function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null || s.status === "archived";
}

export const SchemesSectionCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;

  schemes: PricingScheme[];
  loading: boolean;
  error: string | null;

  includeInactive: boolean;
  includeArchived: boolean;
  onChangeIncludeInactive: (v: boolean) => void;
  onChangeIncludeArchived: (v: boolean) => void;

  onRefresh: () => void | Promise<void>;
  onOpenWorkbench: (schemeId: number) => void;
}> = (props) => {
  const m = useSchemesSectionModel(props);

  const summary = useMemo(() => {
    const total = props.schemes.length;
    const activeN = props.schemes.filter((x) => x.status === "active" && !isArchived(x)).length;
    const inactiveN = props.schemes.filter((x) => x.status === "draft" && !isArchived(x)).length;
    const archivedN = props.schemes.filter((x) => isArchived(x)).length;
    return { total, activeN, inactiveN, archivedN };
  }, [props.schemes]);

  async function setIncludeArchivedAndRefresh(next: boolean) {
    props.onChangeIncludeArchived(next);
    await props.onRefresh();
  }

  async function setIncludeInactiveAndRefresh(next: boolean) {
    props.onChangeIncludeInactive(next);
    await props.onRefresh();
  }

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={`${UI.h2} font-semibold text-slate-900`}>收费标准</div>
          <div className="mt-1 text-sm text-slate-600">
            当前 {summary.total} 条（生效 {summary.activeN} 条，草稿 {summary.inactiveN} 条，归档 {summary.archivedN} 条）。深度编辑请进入工作台。
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex select-none items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={props.includeInactive}
              disabled={props.loading}
              onChange={(e) => void setIncludeInactiveAndRefresh(e.target.checked)}
            />
            显示草稿
          </label>

          <label className="flex select-none items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={props.includeArchived}
              disabled={props.loading}
              onChange={(e) => void setIncludeArchivedAndRefresh(e.target.checked)}
            />
            显示归档
          </label>

          <button type="button" className={UI.btnSecondary} disabled={props.loading} onClick={() => void props.onRefresh()}>
            刷新
          </button>
        </div>
      </div>

      {props.error && <div className={`mt-3 ${UI.error}`}>{props.error}</div>}
      {m.localErr && <div className={`mt-3 ${UI.error}`}>{m.localErr}</div>}
      {m.localOk && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {m.localOk}
        </div>
      )}

      {!props.providerId ? (
        <div className="mt-3 text-sm text-slate-500">请先保存网点基础信息，再维护收费标准。</div>
      ) : (
        <>
          <SchemeCreateBar
            disabled={m.disabled}
            batchBusy={m.batchBusy}
            creating={m.creating}
            newName={m.newName}
            newCurrency={m.newCurrency}
            localErr={null}
            localOk={null}
            onChangeName={m.setNewName}
            onChangeCurrency={m.setNewCurrency}
            onCreate={m.onCreate}
          />

          {!props.includeArchived && summary.archivedN === 0 ? (
            <div className="mt-3 text-sm text-slate-500">提示：已归档方案默认隐藏；如需查看，请勾选“显示归档”。</div>
          ) : null}

          <SchemesTable
            list={props.schemes}
            disabled={m.disabled}
            batchBusy={m.batchBusy}
            rowBusy={m.rowBusy}
            archivingId={m.archivingId}
            onOpenWorkbench={props.onOpenWorkbench}
            onRenameScheme={m.onRenameScheme}
            onPublishScheme={m.onPublishScheme}
            onCloneScheme={m.onCloneScheme}
          />
        </>
      )}
    </section>
  );
};

export default SchemesSectionCard;
