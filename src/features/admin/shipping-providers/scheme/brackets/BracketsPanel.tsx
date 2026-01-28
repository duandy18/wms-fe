// src/features/admin/shipping-providers/scheme/brackets/BracketsPanel.tsx

import React, { useMemo } from "react";
import type { PricingSchemeDetail } from "../../api";

import ZoneSelectCard from "./ZoneSelectCard";
import ZoneEntryCard from "./ZoneEntryCard";
import { useBracketsPanelModel } from "./useBracketsPanelModel";

import { usePricingSchemeMatrix } from "./matrix/usePricingSchemeMatrix";
import SegmentTemplateMatrixTable from "./SegmentTemplateMatrixTable";
import type { RowDraft } from "./quoteModel";

function formatZoneList(zs: Array<{ id: number; name: string }>) {
  const safe = (zs ?? []).filter((z) => z && typeof z.id === "number");
  // 展示上限，避免一屏爆炸
  const top = safe.slice(0, 12);
  const more = safe.length - top.length;
  const line = top.map((z) => `${z.name || "未命名"}(#${z.id})`).join("、");
  return more > 0 ? `${line} …等${safe.length}个` : line;
}

export const BracketsPanel: React.FC<{
  detail: PricingSchemeDetail;
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number | null) => void;
}> = ({ detail, selectedZoneId, onSelectZone }) => {
  const vm = useBracketsPanelModel({ detail, selectedZoneId });

  // ✅ 新世界观：matrix 是事实模型，展示只消费 matrix
  const mx = usePricingSchemeMatrix({ schemeId: detail.id, enabled: true });
  const hasUnbound = (mx.unboundZones?.length ?? 0) > 0;

  // ✅ 写入后强制刷新 matrix：避免“上面已保存、下面仍未设”的双源漂移
  const onSaveAndReload = useMemo(() => {
    return async () => {
      await vm.saveCurrentZonePrices();
      await mx.reload();
    };
  }, [mx, vm]);

  const onUpsertCellAndReload = useMemo(() => {
    return async (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => {
      await vm.upsertCellPrice(args);
      await mx.reload();
    };
  }, [mx, vm]);

  return (
    <div className="space-y-4">
      {vm.successMsg ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <div className="min-w-0">{vm.successMsg}</div>
          <button
            type="button"
            className="shrink-0 text-emerald-800/70 hover:text-emerald-900"
            onClick={vm.clearSuccess}
            aria-label="关闭提示"
            title="关闭"
          >
            ×
          </button>
        </div>
      ) : null}

      <ZoneSelectCard
        busy={vm.busy}
        selectableZones={vm.selectableZones}
        selectedZoneId={selectedZoneId}
        selectedZone={vm.selectedZone}
        currentBracketsCount={vm.currentBrackets.length}
        onSelectZone={onSelectZone}
      />

      <ZoneEntryCard
        busy={vm.busy}
        selectedZoneId={selectedZoneId}
        tableRows={vm.tableRows}
        currentDrafts={vm.currentDrafts}
        currentBrackets={vm.currentBrackets}
        onSetDraft={vm.setDraftForCurrentZone}
        onSave={onSaveAndReload}
      />

      {/* ===== matrix: 事实展示区（替换旧底部大表） ===== */}
      {mx.loading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">正在加载报价矩阵（matrix）…</div>
      ) : mx.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">报价矩阵加载失败</div>
          <div className="mt-1 text-rose-900/80">{mx.error}</div>
          <div className="mt-3">
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-50"
              onClick={() => void mx.reload()}
            >
              重试加载
            </button>
          </div>
        </div>
      ) : hasUnbound ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">存在未绑定重量段模板的区域，已阻断报价表渲染</div>
          <div className="mt-1 text-rose-900/80">
            以下区域未显式绑定重量段模板（segment_template_id 为空）：{formatZoneList(mx.unboundZones)}
          </div>
          <div className="mt-2 text-rose-900/80">
            请先到【区域分类】为上述 Zone 显式绑定一个“启用中的重量段模板”。在未修复前，本页不会展示任何报价表，避免结构误配导致误读。
          </div>
        </div>
      ) : (mx.groups?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          matrix 返回为空：当前方案下暂无可展示的报价表分组（groups=[]）。
        </div>
      ) : (
        <div className="space-y-6">
          {(mx.groups ?? []).map((g) => (
            <SegmentTemplateMatrixTable
              key={g.segment_template_id}
              group={g}
              busy={vm.busy}
              selectedZoneId={selectedZoneId}
              onUpsertCell={onUpsertCellAndReload}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BracketsPanel;
