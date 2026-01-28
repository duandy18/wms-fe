// src/features/admin/shipping-providers/pages/edit/SchemesSectionCard.tsx
import React, { useMemo } from "react";
import { UI } from "../../ui";
import type { PricingScheme } from "../../api/types";
import { SchemeCreateBar } from "./schemes/SchemeCreateBar";
import { SchemesTable } from "./schemes/SchemesTable";
import { useSchemesSectionModel } from "./schemes/useSchemesSectionModel";

function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null;
}

export const SchemesSectionCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;

  schemes: PricingScheme[];
  loading: boolean;
  error: string | null;

  // ✅ Phase 6+：读链路开关（由上层 model 管理）
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
    const activeN = props.schemes.filter((x) => Boolean(x.active) && !isArchived(x)).length;
    const inactiveN = props.schemes.filter((x) => !x.active && !isArchived(x)).length;
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

  async function onArchiveAndKeepVisible(s: PricingScheme) {
    // 归档后默认会隐藏；这里强制打开“显示归档”，避免“归档了就找不回”的 UX 坑
    await m.onArchiveScheme(s);
    if (!props.includeArchived) {
      await setIncludeArchivedAndRefresh(true);
    } else {
      await props.onRefresh();
    }
  }

  async function onUnarchiveAndRefresh(s: PricingScheme) {
    await m.onUnarchiveScheme(s);
    await props.onRefresh();
  }

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={`${UI.h2} font-semibold text-slate-900`}>收费标准</div>
          <div className="mt-1 text-sm text-slate-600">
            当前 {summary.total} 条（启用 {summary.activeN} 条，停用 {summary.inactiveN} 条，归档 {summary.archivedN} 条）。深度编辑请进入工作台。
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
            显示停用
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

      {/* 页面级错误（加载/接口）保留；动作级错误由就近组件展示 */}
      {props.error && <div className={`mt-3 ${UI.error}`}>{props.error}</div>}

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
            localErr={m.localErr}
            localOk={m.localOk}
            onChangeName={m.setNewName}
            onChangeCurrency={m.setNewCurrency}
            onCreate={m.onCreate}
          />

          {!props.includeArchived && summary.archivedN === 0 ? (
            <div className="mt-3 text-sm text-slate-500">提示：已归档的方案默认隐藏；如需取消归档，请勾选“显示归档”。</div>
          ) : null}

          <SchemesTable
            // ✅ 去掉筛选条：表格直接展示“本次从后端拉回来的列表”
            list={props.schemes}
            disabled={m.disabled}
            batchBusy={m.batchBusy}
            rowBusy={m.rowBusy}
            archivingId={m.archivingId}
            onOpenWorkbench={props.onOpenWorkbench}
            onSetActive={m.setActive}
            onRenameScheme={m.onRenameScheme}
            onArchiveScheme={onArchiveAndKeepVisible}
            onUnarchiveScheme={onUnarchiveAndRefresh}
          />
        </>
      )}
    </section>
  );
};
