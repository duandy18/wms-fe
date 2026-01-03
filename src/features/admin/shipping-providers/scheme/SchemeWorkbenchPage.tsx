// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { L } from "./labels";
import { useSchemeWorkbench } from "./useSchemeWorkbench";
import { type SchemeTabKey } from "./types";

// ===== 子模块 =====
import { ZonesPanel } from "./zones/ZonesPanel";
import { BracketsPanel } from "./brackets/BracketsPanel";
import SegmentsPanel from "./brackets/SegmentsPanel";
import { SurchargesPanel } from "./surcharges/SurchargesPanel";
import { QuotePreviewPanel } from "./preview/QuotePreviewPanel";

// ===== components（拆分）=====
import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";

// ===== API =====
import {
  patchZone,
  type PricingSchemeZone,
  createSurcharge,
  patchSurcharge,
  deleteSurcharge,
  type PricingSchemeSurcharge,
  createZoneAtomic,
} from "../api";

function TabButton(props: { label: string; active: boolean; disabled?: boolean; onClick: () => void }) {
  const { label, active, disabled, onClick } = props;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${UI.tabBtn} ${active ? UI.tabBtnActive : UI.tabBtnIdle} ${disabled ? "opacity-60" : ""}`}
    >
      {label}
    </button>
  );
}

export const SchemeWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ schemeId: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const wb = useSchemeWorkbench({ open: true, schemeId });
  const setTab = (k: SchemeTabKey) => wb.setTab(k);

  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  return (
    <div className={UI.page}>
      <WorkbenchHeaderCard
        schemeId={schemeId}
        loading={wb.loading}
        mutating={wb.mutating}
        summary={wb.summary ? { id: wb.summary.id, name: wb.summary.name } : null}
        onBack={() => navigate(-1)}
      />

      {wb.refreshing ? <div className={UI.workbenchSyncBar}>正在同步最新数据…</div> : null}

      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      <div className={UI.tabsWrap}>
        <TabButton label={L.tabZones} active={wb.tab === "zones"} disabled={pageDisabled} onClick={() => setTab("zones")} />
        <TabButton label={L.tabSegments} active={wb.tab === "segments"} disabled={pageDisabled} onClick={() => setTab("segments")} />
        <TabButton label={L.tabBrackets} active={wb.tab === "brackets"} disabled={pageDisabled} onClick={() => setTab("brackets")} />
        <TabButton label={L.tabSurcharges} active={wb.tab === "surcharges"} disabled={pageDisabled} onClick={() => setTab("surcharges")} />
        <TabButton label={L.tabPreview} active={wb.tab === "preview"} disabled={pageDisabled} onClick={() => setTab("preview")} />
      </div>

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>{L.loading}</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">{L.empty}</div>
        ) : (
          <>
            {wb.tab === "zones" ? (
              <ZonesPanel
                detail={wb.detail}
                disabled={pageDisabled}
                selectedZoneId={wb.selectedZoneId}
                onError={(msg) => wb.setError(msg)}
                onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
                onCommitCreate={async (name, provinces) => {
                  await wb.mutate(async () => {
                    const z = await createZoneAtomic(wb.detail!.id, {
                      name,
                      provinces,
                      active: true,
                    });
                    wb.setSelectedZoneId(z.id);
                  });
                }}
                onToggle={async (z: PricingSchemeZone) => {
                  await wb.mutate(async () => {
                    await patchZone(z.id, { active: !z.active });
                  });
                }}
                onChangeBracketAmount={async () => {}}
              />
            ) : null}

            {wb.tab === "segments" ? (
              <SegmentsPanel detail={wb.detail} disabled={pageDisabled} onError={(msg) => wb.setError(msg)} />
            ) : null}

            {wb.tab === "brackets" ? (
              <BracketsPanel
                detail={wb.detail}
                selectedZoneId={wb.selectedZoneId}
                onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId || null)}
              />
            ) : null}

            {wb.tab === "surcharges" ? (
              <SurchargesPanel
                detail={wb.detail}
                disabled={pageDisabled}
                onError={(msg) => wb.setError(msg)}
                onCreate={async (payload) => {
                  await wb.mutate(async () => {
                    await createSurcharge(wb.detail!.id, {
                      name: payload.name,
                      active: true,
                      condition_json: payload.condition_json,
                      amount_json: payload.amount_json,
                    });
                  });
                }}
                onPatch={async (surchargeId, payload) => {
                  await wb.mutate(async () => {
                    await patchSurcharge(surchargeId, payload);
                  });
                }}
                onToggle={async (s: PricingSchemeSurcharge) => {
                  await wb.mutate(async () => {
                    await patchSurcharge(s.id, { active: !s.active });
                  });
                }}
                onDelete={async (s: PricingSchemeSurcharge) => {
                  await wb.mutate(async () => {
                    await deleteSurcharge(s.id);
                  });
                }}
              />
            ) : null}

            {wb.tab === "preview" ? (
              <QuotePreviewPanel
                schemeId={wb.detail.id}
                schemeName={wb.detail.name}
                disabled={pageDisabled}
                onError={(msg) => wb.setError(msg)}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
