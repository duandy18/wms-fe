// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx

import React, { useEffect, useMemo } from "react";
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

// ✅ 归档-释放省份：新接口（不走 active toggle）
import { archiveReleaseZoneProvinces } from "../api/zones";

import { useTemplateGate } from "./workbench/useTemplateGate";
import { useFlashOkBar } from "./workbench/useFlashOkBar";
import SuccessBar from "./workbench/SuccessBar";
import WorkbenchTabs from "./workbench/WorkbenchTabs";
import FlowLockedNotice from "./workbench/FlowLockedNotice";

import { PricingTableWorkbenchPanel } from "./table/PricingTableWorkbenchPanel";

function buildZoneNameFromProvinces(provinces: string[]): string {
  const cleaned = (provinces ?? [])
    .map((x) => (x || "").trim())
    .filter(Boolean);
  return cleaned.join("、");
}

function isSchemeTabKey(v: unknown): v is SchemeTabKey {
  const keys: SchemeTabKey[] = ["table", "segments", "zones", "brackets", "surcharges", "preview"];
  return typeof v === "string" && (keys as string[]).includes(v);
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

  const gate = useTemplateGate({ schemeId });
  const { okMsg, flashOk, clearOk } = useFlashOkBar({ autoHideMs: 2500 });

  // 默认进入 table（二维价格表）
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (params.tab) return;
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/table`, { replace: true });
  }, [navigate, params.tab, schemeId]);

  // URL 直达拦截（当无模板时，禁止直达其它 tab；允许停留在 table/segments）
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    if (gate.checkingTemplates) return;
    if (gate.hasAnyTemplate) return;

    const t = routeTab ?? wb.tab;
    if (t !== "segments" && t !== "table") {
      navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeId, gate.checkingTemplates, gate.hasAnyTemplate, routeTab]);

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

  // ✅ 附加费：不依赖重量段模板 gate，只依赖“页面忙”和“是否归档”
  const surchargesDisabled = pageDisabled || wb.detail?.archived_at != null;

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
          onClick={() => {
            if (!schemeId || schemeId <= 0) return;
            navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench-flow`, { replace: false });
          }}
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
            {wb.tab === "table" ? (
              <PricingTableWorkbenchPanel
                detail={wb.detail}
                disabled={pageDisabled || gate.flowLocked}
                selectedZoneId={wb.selectedZoneId}
                onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
                onError={(msg) => wb.setError(msg)}
                onToggleZone={async (z: PricingSchemeZone) => {
                  // ✅ 收敛：Zone 的“归档”语义 = 归档-释放省份（不再 toggle active）
                  await wb.mutate(async () => {
                    await archiveReleaseZoneProvinces(z.id);
                  });
                  flashOk("已归档-释放省份");
                }}
                onPatchZoneTemplate={async (zoneId: number, templateId: number) => {
                  await wb.mutate(async () => {
                    await patchZone(zoneId, { segment_template_id: templateId });
                  });
                  flashOk("已绑定重量段模板");
                }}
                onUnbindZoneTemplate={async (zoneId: number) => {
                  await wb.mutate(async () => {
                    await patchZone(zoneId, { segment_template_id: null });
                  });
                  flashOk("已解除绑定");
                }}
                onGoZonesTab={() => goTab("zones")}
                onGoSegmentsTab={() => goTab("segments")}
              />
            ) : null}

            {wb.tab === "segments" ? (
              <SegmentsPanel detail={wb.detail} disabled={pageDisabled} onError={(msg) => wb.setError(msg)} />
            ) : null}

            {wb.tab === "zones" ? (
              <ZonesPanel
                detail={wb.detail}
                disabled={pageDisabled || gate.flowLocked}
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
                  flashOk("已创建区域分类");
                }}
                onToggle={async (z: PricingSchemeZone) => {
                  // ✅ 收敛：Zone 的“归档”语义 = 归档-释放省份（不再 toggle active）
                  await wb.mutate(async () => {
                    await archiveReleaseZoneProvinces(z.id);
                  });
                  flashOk("已归档-释放省份");
                }}
                onReplaceProvinceMembers={async (zoneId, provinces) => {
                  await wb.mutate(async () => {
                    await replaceZoneProvinceMembers(zoneId, { provinces });
                    const nextName = buildZoneNameFromProvinces(provinces);
                    if (nextName) await patchZone(zoneId, { name: nextName });
                  });
                  flashOk("已保存区域省份");
                }}
                onPatchZone={async (zoneId, payload) => {
                  await wb.mutate(async () => {
                    await patchZone(zoneId, payload);
                  });
                  flashOk("已保存区域设置");
                }}
              />
            ) : null}

            {wb.tab === "brackets" ? (
              <BracketsPanel detail={wb.detail} selectedZoneId={wb.selectedZoneId} onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId || null)} />
            ) : null}

            {wb.tab === "surcharges" ? (
              <SurchargesPanel
                detail={wb.detail}
                disabled={surchargesDisabled}
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
                  flashOk("已创建附加费规则");
                }}
                onPatch={async (surchargeId, payload) => {
                  await wb.mutate(async () => {
                    await patchSurcharge(surchargeId, payload);
                  });
                  flashOk("已保存附加费规则");
                }}
                onToggle={async (s: PricingSchemeSurcharge) => {
                  await wb.mutate(async () => {
                    await patchSurcharge(s.id, { active: !s.active });
                  });
                  flashOk("已更新附加费状态");
                }}
                onDelete={async (s: PricingSchemeSurcharge) => {
                  await wb.mutate(async () => {
                    await deleteSurcharge(s.id);
                  });
                  flashOk("已删除附加费规则");
                }}
              />
            ) : null}

            {wb.tab === "preview" ? (
              <QuotePreviewPanel schemeId={wb.detail.id} disabled={pageDisabled || gate.flowLocked} onError={(msg) => wb.setError(msg)} />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
