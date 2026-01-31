// src/features/admin/shipping-providers/scheme/SchemeWorkbenchFlowPage.tsx
//
// ✅ 运价方案“纵向主线页”（不取消 tabs）
// - 目标：把 Segments / Zones / 绑定+录价 Table / 目的地附加费 / 规则附加费 / Explain 纵向串起来
// - 原 tabs 入口保留：/workbench/:tab
// - 本页作为新主入口：/workbench-flow
//
// 页面顺序（从上到下，按依赖）：
// 1) 重量段方案（Segments）
// 2) 区域（Zones）
// 3) 区域绑定重量段（绑定在 Table 的 ZoneCard 内完成）
// 4) 二维价格表格（Table）
// 5) 目的地附加费（DestAdjustments）
// 6) 附加费（规则 Surcharges）
// 7) 算价解释（末端只读：预览 + 算价解释）

import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UI } from "./ui";
import { useSchemeWorkbench } from "./useSchemeWorkbench";

import { WorkbenchHeaderCard } from "./components/WorkbenchHeaderCard";
import SuccessBar from "./workbench/SuccessBar";
import FlowLockedNotice from "./workbench/FlowLockedNotice";
import { useTemplateGate } from "./workbench/useTemplateGate";
import { useFlashOkBar } from "./workbench/useFlashOkBar";

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

// ✅ 归档-释放省份：新接口（后端会清空 province members + active=false）
import { archiveReleaseZoneProvinces } from "../api/zones";

import SegmentsSection from "./flow/sections/SegmentsSection";
import ZonesSection from "./flow/sections/ZonesSection";
import PricingSection from "./flow/sections/PricingSection";
import SurchargesSection from "./flow/sections/SurchargesSection";
import ExplainSection from "./flow/sections/ExplainSection";

// ✅ 新：目的地附加费（结构化事实）
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

  // ✅ 附加费（规则）：不依赖模板 gate，只依赖“页面忙”和“是否归档”
  const surchargesDisabled = pageDisabled || wb.detail?.archived_at != null;

  const goCreateTemplate = () => {
    if (!schemeId || schemeId <= 0) return;
    // 仍然跳回原 tabs 的 segments#create（复用你现有的 create 流程 hash）
    navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments#create`);
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
            <SegmentsSection detail={wb.detail} disabled={pageDisabled} onError={(msg) => wb.setError(msg)} />

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
                  if (nextName) await patchZone(zoneId, { name: nextName });
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

            <PricingSection
              detail={wb.detail}
              disabled={pageDisabled}
              flowLocked={gate.flowLocked}
              selectedZoneId={wb.selectedZoneId}
              onSelectZone={(zoneId) => wb.setSelectedZoneId(zoneId)}
              onError={(msg) => wb.setError(msg)}
              onToggleZone={async (z: PricingSchemeZone) => {
                // ✅ 归档-释放省份（释放排他资源）：不再 toggle active
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
              onGoZonesTab={() => {
                if (!schemeId) return;
                navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/zones`);
              }}
              onGoSegmentsTab={() => {
                if (!schemeId) return;
                navigate(`/admin/shipping-providers/schemes/${schemeId}/workbench/segments`);
              }}
            />

            {/* ✅ 新：目的地附加费（结构化事实） */}
            <FlowSectionCard title="5）目的地附加费" desc="结构化事实：province/city 互斥，city 优先。">
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

            <SurchargesSection
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
                emitMatrixUpdated();
              }}
              onPatch={async (surchargeId, payload) => {
                await wb.mutate(async () => {
                  await patchSurcharge(surchargeId, payload);
                });
                flashOk("已保存附加费规则");
                emitMatrixUpdated();
              }}
              onToggle={async (s: PricingSchemeSurcharge) => {
                await wb.mutate(async () => {
                  await patchSurcharge(s.id, { active: !s.active });
                });
                flashOk("已更新附加费状态");
                emitMatrixUpdated();
              }}
              onDelete={async (s: PricingSchemeSurcharge) => {
                await wb.mutate(async () => {
                  await deleteSurcharge(s.id);
                });
                flashOk("已删除附加费规则");
                emitMatrixUpdated();
              }}
            />

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
