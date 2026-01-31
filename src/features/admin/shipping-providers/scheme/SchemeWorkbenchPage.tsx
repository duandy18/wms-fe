// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx

import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { L } from "./labels";
import { useSchemeWorkbench } from "./useSchemeWorkbench";
import type { SchemeTabKey } from "./types";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";
import { useTemplateGate } from "./workbench/useTemplateGate";
import { useFlashOkBar } from "./workbench/useFlashOkBar";
import SuccessBar from "./workbench/SuccessBar";
import WorkbenchTabs from "./workbench/WorkbenchTabs";
import FlowLockedNotice from "./workbench/FlowLockedNotice";

import { isSchemeTabKey } from "./workbench-page/types";
import { useWorkbenchNav } from "./workbench-page/useWorkbenchNav";
import { useWorkbenchGuards } from "./workbench-page/useWorkbenchGuards";
import { useWorkbenchActions } from "./workbench-page/useWorkbenchActions";
import { renderWorkbenchTab } from "./workbench-page/renderTab";

export const SchemeWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ schemeId: string; tab?: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const routeTab: SchemeTabKey | null = useMemo(() => {
    if (!params.tab) return null;
    return isSchemeTabKey(params.tab) ? params.tab : null;
  }, [params.tab]);

  const wb = useSchemeWorkbench({ open: true, schemeId });
  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  const gate = useTemplateGate({ schemeId });
  const { okMsg, flashOk, clearOk } = useFlashOkBar({ autoHideMs: 2500 });

  const providerId = wb.detail?.shipping_provider_id ?? null;

  const { goTab, goFlowPage, onBack } = useWorkbenchNav({
    schemeId,
    location,
    navigate,
    providerId,
  });

  useWorkbenchGuards({
    schemeId,
    routeTab,
    paramsTab: params.tab,
    wbTab: wb.tab,
    setWbTab: wb.setTab,
    gateCheckingTemplates: gate.checkingTemplates,
    gateHasAnyTemplate: gate.hasAnyTemplate,
    navigate,
  });

  // ✅ 附加费（规则）：不依赖重量段模板 gate，只依赖“页面忙”和“是否归档”
  const surchargesDisabled = pageDisabled || wb.detail?.archived_at != null;

  const actions = useWorkbenchActions({
    wb: {
      detail: wb.detail,
      selectedZoneId: wb.selectedZoneId,
      setSelectedZoneId: wb.setSelectedZoneId,
      mutate: wb.mutate,
      setError: (msg) => wb.setError(msg),
    },
    flashOk,
    goTab: (k) => goTab(k),
  });

  const goCreateTemplate = () => {
    if (!schemeId || schemeId <= 0) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments#create`);
  };

  return (
    <div className={UI.page}>
      <WorkbenchHeaderCard
        schemeId={schemeId}
        loading={wb.loading}
        mutating={wb.mutating}
        summary={wb.summary ? { id: wb.summary.id, name: wb.summary.name } : null}
        providerName={wb.providerName}
        onBack={onBack}
      />

      {wb.refreshing ? <div className={UI.workbenchSyncBar}>正在同步最新数据…</div> : null}

      <SuccessBar msg={okMsg} onClose={clearOk} />
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      <div className="flex items-center justify-between gap-3">
        <WorkbenchTabs
          tab={wb.tab}
          pageDisabled={pageDisabled}
          checkingTemplates={gate.checkingTemplates}
          flowLocked={gate.flowLocked}
          onGoTab={goTab}
        />

        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          disabled={!schemeId || schemeId <= 0}
          onClick={goFlowPage}
          title="打开纵向主线页（重量段 → 区域 → 绑定 → 价格表 → 附加费 → 解释）"
        >
          纵向主线页
        </button>
      </div>

      <FlowLockedNotice open={gate.flowLocked} onGoCreateTemplate={goCreateTemplate} />

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>{L.loading}</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">{L.empty}</div>
        ) : (
          <>
            {renderWorkbenchTab({
              tab: wb.tab,
              detail: wb.detail,
              pageDisabled,
              flowLocked: gate.flowLocked,
              checkingTemplates: gate.checkingTemplates,
              selectedZoneId: wb.selectedZoneId,
              setSelectedZoneId: wb.setSelectedZoneId,
              setError: (msg) => wb.setError(msg),
              surchargesDisabled,
              actions,
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
