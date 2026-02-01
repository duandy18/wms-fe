// src/features/admin/shipping-providers/scheme/SchemeWorkbenchFlowPage.tsx
//
// ✅ 运价方案“纵向主线页”（唯一工作台）
// - 目标：把 Segments / Zones / 绑定+录价 Table / 目的地附加费 / Explain 纵向串起来
// - 本页主入口：/workbench-flow
//
// 页面顺序（从上到下，按依赖）：
// 1) 重量段方案（Segments）
// 2) 区域（Zones）
// 3) 区域绑定重量段（绑定在 Table 的 ZoneCard 内完成）
// 4) 二维价格表格（Table）
// 5) 目的地附加费（DestAdjustments）
// 6) 算价解释（末端只读：预览 + 算价解释）

import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { useSchemeWorkbench } from "./useSchemeWorkbench";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";
import SuccessBar from "./workbench/SuccessBar";
import FlowLockedNotice from "./workbench/FlowLockedNotice";
import { useTemplateGate } from "./workbench/useTemplateGate";
import { useFlashOkBar } from "./workbench/useFlashOkBar";

import { patchZone, type PricingSchemeZone, createZoneAtomic, replaceZoneProvinceMembers } from "../api";

// ✅ 归档-释放省份：新接口（后端会清空 province members + active=false）
import { archiveReleaseZoneProvinces } from "../api/zones";

import SegmentsSection from "./flow/sections/SegmentsSection";
import ZonesSection from "./flow/sections/ZonesSection";
import PricingSection from "./flow/sections/PricingSection";
import ExplainSection from "./flow/sections/ExplainSection";

// ✅ 目的地附加费
import FlowSectionCard from "./flow/FlowSectionCard";
import DestAdjustmentsPanel from "./dest-adjustments/DestAdjustmentsPanel";
import { upsertDestAdjustment, patchDestAdjustment, deleteDestAdjustment } from "../api/destAdjustments";

type WorkbenchLocationState = {
  from?: string;
};

function buildZoneNameFromProvinces(provinces: string[]): string {
  const cleaned = (provinces ?? [])
    .map((x) => (x || "").trim())
    .filter(Boolean);
  return cleaned.join("、");
}

// ✅ 明确事件：事实变更后通知“末端只读区”刷新（不做隐式兜底）
const PRICING_MATRIX_UPDATED_EVENT = "wms:pricing-matrix-updated";

export const SchemeWorkbenchFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ schemeId: string }>();
  const schemeId = params.schemeId ? Number(params.schemeId) : null;

  const wb = useSchemeWorkbench({ open: true, schemeId });
  const pageDisabled = wb.loading || wb.refreshing || wb.mutating;

  // Gate：是否已有至少一个“启用中的重量段模板”
  // - 本页顺序已把 Segments 放在最上方，但仍然保留 gate 作为“后续步骤禁用”的硬护栏
  const gate = useTemplateGate({ schemeId });

  const { okMsg, flashOk, clearOk } = useFlashOkBar({ autoHideMs: 2500 });

  const emitMatrixUpdated = () => {
    try {
      window.dispatchEvent(new Event(PRICING_MATRIX_UPDATED_EVENT));
    } catch {
      // no-op：不让 UI 因为浏览器差异炸掉
    }
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

  // ✅ Segments/Zones 同页锚点：取代 tabs 跳转
  const segmentsAnchorRef = useRef<HTMLDivElement | null>(null);
  const zonesAnchorRef = useRef<HTMLDivElement | null>(null);

  const onGoSegmentsSection = useMemo(() => {
    return () => {
      segmentsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }, []);

  const onGoZonesSection = useMemo(() => {
    return () => {
      zonesAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
  }, []);

  // Gate 触发的“去创建模板”也改为同页引导（不再跳旧入口）
  const goCreateTemplate = () => {
    onGoSegmentsSection();
  };

  // 体验：首次进入若没有选中 zone，让 wb 自己的逻辑去选（useSchemeWorkbench 已做）
  useEffect(() => {
    if (!schemeId || schemeId <= 0) return;
    // no-op：保留这个 effect 作为后续扩展点（例如滚动定位）
  }, [schemeId]);

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

      <FlowLockedNotice open={gate.flowLocked} onGoCreateTemplate={goCreateTemplate} />

      <div className="space-y-4">
        {wb.loading && !wb.detail ? (
          <div className={UI.zonePageHint}>正在加载…</div>
        ) : !wb.detail ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">暂无数据</div>
        ) : (
          <>
            <div ref={segmentsAnchorRef}>
              <SegmentsSection detail={wb.detail} disabled={pageDisabled} onError={(msg) => wb.setError(msg)} />
            </div>

            <div ref={zonesAnchorRef}>
              <ZonesSection
                detail={wb.detail}
                disabled={pageDisabled}
                flowLocked={gate.flowLocked}
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
                  emitMatrixUpdated();
                }}
                onToggle={async (z: PricingSchemeZone) => {
                  // ✅ 归档-释放省份（释放排他资源）：不再 toggle active
                  await wb.mutate(async () => {
                    await archiveReleaseZoneProvinces(z.id);
                  });
                  flashOk("已归档-释放省份");
                  emitMatrixUpdated();
                }}
                onReplaceProvinceMembers={async (zoneId, provinces) => {
                  await wb.mutate(async () => {
                    await replaceZoneProvinceMembers(zoneId, { provinces });
                    const nextName = buildZoneNameFromProvinces(provinces);
                    if (nextName) {
                      await patchZone(zoneId, { name: nextName });
                    }
                  });
                  flashOk("已保存区域省份");
                  emitMatrixUpdated();
                }}
                onPatchZone={async (zoneId, payload) => {
                  await wb.mutate(async () => {
                    await patchZone(zoneId, payload);
                  });
                  flashOk("已保存区域设置");
                  emitMatrixUpdated();
                }}
              />
            </div>

            <PricingSection
              detail={wb.detail}
              disabled={pageDisabled}
              flowLocked={gate.flowLocked}
              selectedZoneId={wb.selectedZoneId}
              onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
              onError={(msg) => wb.setError(msg)}
              onToggleZone={async (z: PricingSchemeZone) => {
                await wb.mutate(async () => {
                  await archiveReleaseZoneProvinces(z.id);
                });
                flashOk("已归档-释放省份");
                emitMatrixUpdated();
              }}
              onPatchZoneTemplate={async (zoneId: number, templateId: number) => {
                await wb.mutate(async () => {
                  await patchZone(zoneId, { segment_template_id: templateId });
                });
                flashOk("已绑定重量段模板");
                emitMatrixUpdated();
              }}
              onUnbindZoneTemplate={async (zoneId: number) => {
                await wb.mutate(async () => {
                  await patchZone(zoneId, { segment_template_id: null });
                });
                flashOk("已解除绑定");
                emitMatrixUpdated();
              }}
              // ✅ tabs 退役：改为同页滚动
              onGoZonesTab={onGoZonesSection}
              onGoSegmentsTab={onGoSegmentsSection}
            />

            <FlowSectionCard title="5）目的地附加费">
              <DestAdjustmentsPanel
                schemeId={wb.detail.id}
                list={wb.detail.dest_adjustments ?? []}
                disabled={pageDisabled || wb.detail?.archived_at != null}
                onError={(msg) => wb.setError(msg)}
                onUpsert={async (payload) => {
                  await wb.mutate(async () => {
                    await upsertDestAdjustment(wb.detail!.id, payload);
                  });
                  flashOk("已写入目的地附加费");
                  emitMatrixUpdated();
                }}
                onPatch={async (id, payload) => {
                  await wb.mutate(async () => {
                    await patchDestAdjustment(id, payload);
                  });
                  flashOk("已更新目的地附加费");
                  emitMatrixUpdated();
                }}
                onDelete={async (id) => {
                  await wb.mutate(async () => {
                    await deleteDestAdjustment(id);
                  });
                  flashOk("已删除目的地附加费");
                  emitMatrixUpdated();
                }}
              />
            </FlowSectionCard>

            <ExplainSection
              schemeId={wb.detail.id}
              selectedZoneId={wb.selectedZoneId}
              disabled={pageDisabled || gate.flowLocked}
              onError={(msg) => wb.setError(msg)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SchemeWorkbenchFlowPage;
