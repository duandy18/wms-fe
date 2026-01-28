// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { L } from "./labels";
import { useSchemeWorkbench } from "./useSchemeWorkbench";
import { type SchemeTabKey } from "./types";

import { ZonesPanel } from "./zones/ZonesPanel";
import { BracketsPanel } from "./brackets/BracketsPanel";
import SegmentsPanel from "./brackets/SegmentsPanel";
import { SurchargesPanel } from "./surcharges/SurchargesPanel";
import { QuotePreviewPanel } from "./preview/QuotePreviewPanel";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";

import {
  patchZone,
  type PricingSchemeZone,
  createSurcharge,
  patchSurcharge,
  deleteSurcharge,
  type PricingSchemeSurcharge,
  createZoneAtomic,
  replaceZoneProvinceMembers,
} from "../api";

import { fetchSegmentTemplates } from "./brackets/segmentTemplates";

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

function buildZoneNameFromProvinces(provinces: string[]): string {
  const cleaned = (provinces ?? []).map((x) => (x || "").trim()).filter(Boolean);
  return cleaned.join("、");
}

// ✅ 强制流程顺序
const TAB_KEYS: SchemeTabKey[] = ["segments", "zones", "brackets", "surcharges", "preview"];

function isSchemeTabKey(v: unknown): v is SchemeTabKey {
  return typeof v === "string" && (TAB_KEYS as string[]).includes(v);
}

type WorkbenchLocationState = {
  from?: string;
};

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

  // ===== Gate：是否存在至少一个重量段模板 =====
  const [checkingTemplates, setCheckingTemplates] = useState(true);
  const [hasAnyTemplate, setHasAnyTemplate] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!schemeId || schemeId <= 0) return;

      let nextHasAnyTemplate = true;

      try {
        setCheckingTemplates(true);
        const list = await fetchSegmentTemplates(schemeId);
        nextHasAnyTemplate = (list ?? []).length > 0;
      } catch {
        // 保守放行：避免因短暂接口异常锁死流程
        nextHasAnyTemplate = true;
      }

      if (!cancelled) {
        setHasAnyTemplate(nextHasAnyTemplate);
        setCheckingTemplates(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [schemeId]);

  // 默认进入 segments
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (params.tab) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments`, { replace: true });
  }, [navigate, params.tab, schemeId]);

  // URL 直达拦截
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (checkingTemplates) return;
    if (hasAnyTemplate) return;

    const t = routeTab ?? wb.tab;
    if (t !== "segments") {
      navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId, checkingTemplates, hasAnyTemplate, routeTab]);

  useEffect(() => {
    if (!routeTab) return;
    if (wb.tab === routeTab) return;
    wb.setTab(routeTab);
  }, [routeTab, wb]);

  const goTab = (k: SchemeTabKey) => {
    if (!schemeId || schemeId <= 0) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/${k}`);
  };

  const onBack = () => {
    const st = (location.state ?? {}) as WorkbenchLocationState;
    if (typeof st.from === "string" && st.from.trim()) {
      navigate(st.from, { replace: true });
      return;
    }

    const providerId = wb.detail?.shipping_provider_id ?? null;
    if (typeof providerId === "number" && providerId > 0) {
      navigate(`/admin/shipping-providers/${providerId}/edit`, { replace: true });
      return;
    }

    navigate("/admin/shipping-providers", { replace: true });
  };

  const flowLocked = !checkingTemplates && !hasAnyTemplate;

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
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      <div className={UI.tabsWrap}>
        <TabButton label={L.tabSegments} active={wb.tab === "segments"} disabled={pageDisabled} onClick={() => goTab("segments")} />
        <TabButton label={L.tabZones} active={wb.tab === "zones"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => goTab("zones")} />
        <TabButton label={L.tabBrackets} active={wb.tab === "brackets"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => goTab("brackets")} />
        <TabButton label={L.tabSurcharges} active={wb.tab === "surcharges"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => goTab("surcharges")} />
        <TabButton label={L.tabPreview} active={wb.tab === "preview"} disabled={pageDisabled || checkingTemplates || flowLocked} onClick={() => goTab("preview")} />
      </div>

      {flowLocked ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">请先创建重量段模板</div>
          <div className="mt-1 text-amber-900/80">
            当前方案尚未创建任何重量段模板。为避免区域与录价发生误配，系统已暂时锁定后续步骤。
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" className={UI.btnPrimaryGreen} onClick={goCreateTemplate}>
              去创建重量段模板
            </button>
            <div className="text-xs text-amber-900/70">完成后将自动解锁后续流程</div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>{L.loading}</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">{L.empty}</div>
        ) : (
          <>
            {wb.tab === "segments" ? <SegmentsPanel detail={wb.detail} disabled={pageDisabled} onError={(msg) => wb.setError(msg)} /> : null}

            {wb.tab === "zones" ? (
              <ZonesPanel
                detail={wb.detail}
                disabled={pageDisabled || flowLocked}
                selectedZoneId={wb.selectedZoneId}
                onError={(msg) => wb.setError(msg)}
                onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
                onCommitCreate={async (name, provinces, segmentTemplateId) => {
                  await wb.mutate(async () => {
                    const z = await createZoneAtomic(wb.detail!.id, {
                      name,
                      provinces,
                      active: true,
                      segment_template_id: segmentTemplateId,
                    });
                    wb.setSelectedZoneId(z.id);
                  });
                }}
                onToggle={async (z: PricingSchemeZone) => {
                  await wb.mutate(async () => {
                    await patchZone(z.id, { active: !z.active });
                  });
                }}
                onReplaceProvinceMembers={async (zoneId, provinces) => {
                  await wb.mutate(async () => {
                    await replaceZoneProvinceMembers(zoneId, { provinces });
                    const nextName = buildZoneNameFromProvinces(provinces);
                    if (nextName) await patchZone(zoneId, { name: nextName });
                  });
                }}
                onPatchZone={async (zoneId, payload) => {
                  await wb.mutate(async () => {
                    await patchZone(zoneId, payload);
                  });
                }}
              />
            ) : null}

            {wb.tab === "brackets" ? (
              <BracketsPanel detail={wb.detail} selectedZoneId={wb.selectedZoneId} onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId || null)} />
            ) : null}

            {wb.tab === "surcharges" ? (
              <SurchargesPanel
                detail={wb.detail}
                disabled={pageDisabled || flowLocked}
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

            {wb.tab === "preview" ? <QuotePreviewPanel schemeId={wb.detail.id} disabled={pageDisabled || flowLocked} onError={(msg) => wb.setError(msg)} /> : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
