// src/features/admin/shipping-providers/scheme/SchemeWorkbenchPage.tsx
//
// 运输价格设置平台
// - 面向业务用户：不暴露 schemeId 等工程细节
// - 顶部只保留：页面名称 + Tabs + 返回
// - 技术状态（loading / mutating）仅作为轻提示
// - 新增：总览/导出（只读总览 + CSV 导出）

import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UI } from "./ui";
import { L } from "./labels";
import { useSchemeWorkbench } from "./useSchemeWorkbench";
import type { SchemeTabKey } from "./types";

import WorkbenchHeader from "./WorkbenchHeader";
import WorkbenchTabs from "./WorkbenchTabs";
import WorkbenchContent from "./WorkbenchContent";
import { TAB_KEYS, explainNeedZone, needsZone, parseTab } from "./workbenchTabs";

import {
  patchZone,
  type PricingSchemeZone,
  createSurcharge,
  patchSurcharge,
  deleteSurcharge,
  type PricingSchemeSurcharge,
  createZoneAtomic,
} from "../api";

export const SchemeWorkbenchPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<{ schemeId: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = useMemo(() => parseTab(searchParams.get("tab")), [searchParams]);

  const wb = useSchemeWorkbench({ open: true, schemeId });

  // ✅ URL → state（仅在变化时同步，避免循环）+ 需要 zone 的 tab 防呆带路
  useEffect(() => {
    if (!requestedTab) return;
    if (wb.tab === requestedTab) return;

    if (needsZone(requestedTab) && !wb.selectedZoneId) {
      wb.setError(explainNeedZone(requestedTab));
      wb.setTab("zones");
      return;
    }

    wb.setTab(requestedTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedTab, wb.selectedZoneId]);

  // state → URL（replace，不污染历史）
  useEffect(() => {
    const cur = parseTab(searchParams.get("tab"));
    if (cur === wb.tab) return;

    const next = new URLSearchParams(searchParams);
    next.set("tab", wb.tab);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wb.tab]);

  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  // ✅ Tabs 点击统一走这里（把“需要 zone 才能进”的逻辑收口）
  const goTab = (k: SchemeTabKey) => {
    if (needsZone(k) && !wb.selectedZoneId) {
      wb.setError(explainNeedZone(k));
      wb.setTab("zones");
      return;
    }
    wb.setTab(k);
  };

  const tabItems = useMemo(
    () => [
      { key: "zones", label: L.tabZones },
      { key: "segments", label: L.tabSegments },
      { key: "pricing", label: L.tabPricing },
      { key: "surcharges", label: L.tabSurcharges },
      { key: "preview", label: L.tabPreview },
      { key: "overview", label: L.tabOverview },
    ],
    [],
  );

  // 容错：如果 wb.tab 不在 TAB_KEYS，回 zones（理论上不会发生）
  const safeTab: SchemeTabKey = useMemo(() => (TAB_KEYS.includes(wb.tab) ? wb.tab : "zones"), [wb.tab]);

  return (
    <div className={UI.page}>
      {/* 顶部轻量状态提示（不占主视觉） */}
      {wb.refreshing ? <div className={UI.workbenchSyncBar}>正在同步最新数据…</div> : null}
      {wb.error ? <div className={UI.error}>{wb.error}</div> : null}

      {/* ===== 顶部主控区 ===== */}
      <WorkbenchHeader
        title="运输价格设置平台"
        subtitle="按顺序：先建区域 → 配重量段 → 录价格 → 配附加费 → 预览核对。"
        loading={wb.loading}
        mutating={wb.mutating}
        disabled={pageDisabled}
        onBack={() => navigate(-1)}
      />
      <WorkbenchTabs active={safeTab} disabled={pageDisabled} tabs={tabItems} onClickTab={(k) => goTab(k as SchemeTabKey)} />

      {/* ===== 内容区 ===== */}
      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.emptyText}>{L.loading}</div>
        ) : !wb.detail ? (
          <div className={UI.cardSoft}>
            <div className={UI.emptyText}>{L.empty}</div>
          </div>
        ) : (
          <WorkbenchContent
            tab={safeTab}
            detail={wb.detail}
            disabled={pageDisabled}
            selectedZoneId={wb.selectedZoneId}
            onSelectZoneId={(zoneId) => wb.setSelectedZoneId(zoneId)}
            onError={(msg) => wb.setError(msg)}
            onCommitCreateZone={async (name, provinces) => {
              await wb.mutate(async () => {
                const z = await createZoneAtomic(wb.detail!.id, {
                  name,
                  provinces,
                  priority: 100,
                  active: true,
                });
                wb.setSelectedZoneId(z.id);
              });
            }}
            onToggleZone={async (z: PricingSchemeZone) => {
              await wb.mutate(async () => {
                await patchZone(z.id, { active: !z.active });
              });
            }}
            onCreateSurcharge={async (payload) => {
              await wb.mutate(async () => {
                await createSurcharge(wb.detail!.id, {
                  name: payload.name,
                  priority: payload.priority,
                  active: true,
                  condition_json: payload.condition_json,
                  amount_json: payload.amount_json,
                });
              });
            }}
            onPatchSurcharge={async (surchargeId, payload) => {
              await wb.mutate(async () => {
                await patchSurcharge(surchargeId, payload);
              });
            }}
            onToggleSurcharge={async (s: PricingSchemeSurcharge) => {
              await wb.mutate(async () => {
                await patchSurcharge(s.id, { active: !s.active });
              });
            }}
            onDeleteSurcharge={async (s: PricingSchemeSurcharge) => {
              await wb.mutate(async () => {
                await deleteSurcharge(s.id);
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchPage;
