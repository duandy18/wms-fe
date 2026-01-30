// src/features/admin/shipping-providers/scheme/table/PricingTableWorkbenchPanel.tsx

import React, { useMemo, useRef } from "react";
import type { PricingSchemeDetail, PricingSchemeZone } from "../../api";
import type { RowDraft } from "../brackets/quoteModel";

import { useBracketsPanelModel } from "../brackets/useBracketsPanelModel";
import ZoneEntryCard from "../brackets/ZoneEntryCard";

import { usePricingSchemeMatrix } from "../brackets/matrix/usePricingSchemeMatrix";
import type { ZoneBracketsMatrixGroup } from "../brackets/matrix/types";

import { useSchemeTemplatesLite } from "./hooks/useSchemeTemplatesLite";
import { buildZonePricePreview } from "./utils/pricePreview";

import ZoneCard from "./cards/ZoneCard";
import PricingEditorCard from "./cards/PricingEditorCard";
import PriceTablePreviewCard from "./cards/PriceTablePreviewCard";
import QuoteExplainCard from "./cards/QuoteExplainCard";

export const PricingTableWorkbenchPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled: boolean;
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;
  onError: (msg: string) => void;

  onToggleZone: (z: PricingSchemeZone) => Promise<void>;
  onPatchZoneTemplate: (zoneId: number, templateId: number) => Promise<void>;

  // ✅ 解除绑定：segment_template_id -> null
  onUnbindZoneTemplate: (zoneId: number) => Promise<void>;

  onGoZonesTab: () => void;
  onGoSegmentsTab: () => void;
}> = (p) => {
  const { detail, disabled, selectedZoneId, onSelectZone, onError } = p;

  const vm = useBracketsPanelModel({ detail, selectedZoneId });

  const mx = usePricingSchemeMatrix({ schemeId: detail.id, enabled: true });

  const groups = useMemo(() => (mx.groups ?? []) as ZoneBracketsMatrixGroup[], [mx.groups]);

  const templates = useSchemeTemplatesLite({ schemeId: detail.id });

  const onUpsertCellAndReload = useMemo(() => {
    return async (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => {
      await vm.upsertCellPrice(args);
      await mx.reload();
    };
  }, [mx, vm]);

  const onSaveCurrentZoneAndReload = useMemo(() => {
    return async () => {
      await vm.saveCurrentZonePrices();
      await mx.reload();
    };
  }, [mx, vm]);

  const preview = useMemo(() => {
    return buildZonePricePreview({ mx: { groups }, selectedZoneId });
  }, [groups, selectedZoneId]);

  // ✅ “回到按区域批量录价”的锚点
  const batchEditorRef = useRef<HTMLDivElement | null>(null);

  const onRequestEditZone = useMemo(() => {
    return (zoneId: number) => {
      if (typeof zoneId !== "number" || !Number.isFinite(zoneId) || zoneId <= 0) return;
      onSelectZone(zoneId);

      // 体验：切换后把视线拉回主编辑入口
      window.setTimeout(() => {
        batchEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    };
  }, [onSelectZone]);

  return (
    <div className="space-y-4">
      {/* ===== Model 层可解释提示（替代 alert） ===== */}
      {vm.errorMsg ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          <div className="min-w-0">{vm.errorMsg}</div>
          <button
            type="button"
            className="shrink-0 text-rose-900/70 hover:text-rose-900"
            onClick={vm.clearError}
            aria-label="关闭提示"
            title="关闭"
          >
            ×
          </button>
        </div>
      ) : null}

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

      <ZoneCard
        detail={detail}
        disabled={disabled}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
        templatesLoading={templates.loading}
        templatesError={templates.error}
        activeTemplates={templates.activeTemplates}
        onReloadTemplates={() => void templates.reload()}
        onPatchZoneTemplate={async (zoneId, templateId) => {
          await p.onPatchZoneTemplate(zoneId, templateId);
          await mx.reload();
        }}
        onUnbindZoneTemplate={async (zoneId) => {
          await p.onUnbindZoneTemplate(zoneId);
          await mx.reload();
        }}
        onGoZonesTab={p.onGoZonesTab}
        onGoSegmentsTab={p.onGoSegmentsTab}
        onError={onError}
      />

      {/* ✅ 当前区域价格录入：就地提供 Zone 下拉框（避免来回切换） */}
      <div ref={batchEditorRef} className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-slate-900">当前区域价格录入（批量）</div>
            <div className="mt-1 text-sm text-slate-600">
              先选择区域，再逐段录入并保存；保存后下方综合报价表会立即刷新。综合表为只读，修改请点击每行【修改】回到这里。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-600">选择区域</div>
            <select
              className="min-w-[280px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={selectedZoneId ?? ""}
              disabled={disabled || vm.busy}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                const id = Number(v);
                if (!Number.isFinite(id) || id <= 0) return;
                onSelectZone(id);
              }}
            >
              <option value="">请选择区域…</option>
              {(vm.selectableZones ?? []).map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name || `zone#${z.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {/* 录价：按“当前选中 Zone”逐段录入，保存后成果在 matrix 上体现 */}
          <ZoneEntryCard
            busy={vm.busy || disabled}
            selectedZoneId={selectedZoneId}
            tableRows={vm.tableRows}
            currentDrafts={vm.currentDrafts}
            currentBrackets={vm.currentBrackets}
            onSetDraft={vm.setDraftForCurrentZone}
            onSave={onSaveCurrentZoneAndReload}
          />
        </div>
      </div>

      {/* ✅ 二维价格表：综合展示（只读）+ 行操作“修改” */}
      <PricingEditorCard
        disabled={disabled}
        mxLoading={mx.loading}
        mxError={mx.error ?? null}
        groups={groups}
        selectedZoneId={selectedZoneId}
        busy={vm.busy}
        onReload={() => void mx.reload()}
        onUpsertCell={onUpsertCellAndReload}
        onRequestEditZone={onRequestEditZone}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PriceTablePreviewCard title={preview.title} selectedZoneId={selectedZoneId} rows={preview.rows} />
        <QuoteExplainCard schemeId={detail.id} disabled={disabled} onError={onError} />
      </div>
    </div>
  );
};

export default PricingTableWorkbenchPanel;
