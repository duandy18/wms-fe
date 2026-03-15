// src/features/tms/providers/pages/edit/SchemesSectionCard.tsx
import React, { useMemo } from "react";
import { UI } from "../../ui";
import type { PricingScheme } from "../../api/types";
import { SchemeCreateBar } from "./schemes/SchemeCreateBar";
import { SchemesTable } from "./schemes/SchemesTable";
import { useSchemesSectionModel } from "./schemes/useSchemesSectionModel";

type ActiveBindingWarehouse = {
  warehouse_id: number;
  warehouse_label: string;
};

function isArchived(s: PricingScheme): boolean {
  return s.archived_at != null || s.status === "archived";
}

function pickCurrentActiveScheme(schemes: PricingScheme[]): PricingScheme | null {
  const activeList = schemes.filter((x) => !isArchived(x) && x.status === "active");
  if (activeList.length === 0) return null;

  activeList.sort((a, b) => {
    const aTs = a.effective_from ? Date.parse(a.effective_from) : Number.NEGATIVE_INFINITY;
    const bTs = b.effective_from ? Date.parse(b.effective_from) : Number.NEGATIVE_INFINITY;
    if (aTs !== bTs) return bTs - aTs;
    return b.id - a.id;
  });

  return activeList[0] ?? null;
}

export const SchemesSectionCard: React.FC<{
  canWrite: boolean;
  busy: boolean;
  providerId: number | null;
  activeBindingWarehouses: ActiveBindingWarehouse[];

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
  const m = useSchemesSectionModel({
    canWrite: props.canWrite,
    busy: props.busy,
    providerId: props.providerId,
    activeBindingWarehouses: props.activeBindingWarehouses,
    schemes: props.schemes,
    loading: props.loading,
    error: props.error,
    onRefresh: props.onRefresh,
  });

  const summary = useMemo(() => {
    const visibleSchemes = props.schemes.filter((x) => !isArchived(x));
    const total = visibleSchemes.length;
    const activeN = visibleSchemes.filter((x) => x.status === "active").length;
    const draftN = visibleSchemes.filter((x) => x.status === "draft").length;
    return { total, activeN, draftN };
  }, [props.schemes]);

  const currentActiveScheme = useMemo(() => {
    return pickCurrentActiveScheme(props.schemes);
  }, [props.schemes]);

  const activeBindingCount = props.activeBindingWarehouses.length;

  return (
    <section className={UI.card}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={`${UI.h2} font-semibold text-slate-900`}>运价方案</div>
          <div className="mt-1 text-sm text-slate-600">
            当前显示 {summary.total} 条（生效 {summary.activeN} 条，草稿 {summary.draftN} 条）。深度编辑请进入工作台。
          </div>
          <div className="mt-2 text-sm text-slate-700">
            当前生效方案：
            <span className="ml-1 font-medium text-slate-900">{currentActiveScheme ? currentActiveScheme.name : "无"}</span>
          </div>
          <div className="mt-2 text-sm text-slate-700">
            当前可建方案仓库：
            <span className="ml-1 font-medium text-slate-900">
              {activeBindingCount > 0 ? props.activeBindingWarehouses.map((x) => x.warehouse_label).join("、") : "无"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
        <div className="mt-3 text-sm text-slate-500">请先保存网点基础信息，再维护运价方案。</div>
      ) : (
        <>
          {activeBindingCount <= 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              当前没有“已绑定且启用”的仓库，不能创建收费标准。先去上面的“仓库绑定”里启用至少一个仓库，别拿空气去算价。
            </div>
          ) : null}

          <SchemeCreateBar
            disabled={m.disabled}
            batchBusy={m.batchBusy}
            creating={m.creating}
            newName={m.newName}
            newCurrency={m.newCurrency}
            activeBindingWarehouses={props.activeBindingWarehouses}
            selectedWarehouseId={m.selectedWarehouseId}
            localErr={m.localErr}
            localOk={m.localOk}
            onChangeName={m.setNewName}
            onChangeCurrency={m.setNewCurrency}
            onChangeSelectedWarehouseId={m.setSelectedWarehouseId}
            onCreate={m.onCreate}
          />

          <SchemesTable
            list={m.filtered}
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
