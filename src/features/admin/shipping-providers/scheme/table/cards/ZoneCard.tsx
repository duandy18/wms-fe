// src/features/admin/shipping-providers/scheme/table/cards/ZoneCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeDetail } from "../../../api";
import ZoneSelectCard from "../../brackets/ZoneSelectCard";
import type { SegmentTemplateLite } from "../../zones/segmentTemplatesApi";

import BindingOverviewTable from "./zoneCard/BindingOverviewTable";
import useTemplateDetailsLite from "./zoneCard/useTemplateDetailsLite";
import { templateLabel } from "./zoneCard/templateFmt";

export const ZoneCard: React.FC<{
  detail: PricingSchemeDetail;
  disabled: boolean;

  // 当前选择
  selectedZoneId: number | null;
  onSelectZone: (zoneId: number) => void;

  // 绑定模板（已保存版本候选）
  templatesLoading: boolean;
  templatesError: string | null;
  activeTemplates: SegmentTemplateLite[];
  onReloadTemplates: () => void;
  onPatchZoneTemplate: (zoneId: number, templateId: number) => Promise<void>;

  // ✅ 解绑模板（segment_template_id -> null）
  onUnbindZoneTemplate: (zoneId: number) => Promise<void>;

  // ✅ 同页定位（历史名保留，但语义为“回到本页段落”）
  onGoZonesTab: () => void;
  onGoSegmentsTab: () => void;

  // 其他
  onError: (msg: string) => void;
}> = (p) => {
  const {
    detail,
    disabled,
    selectedZoneId,
    onSelectZone,
    templatesLoading,
    templatesError,
    activeTemplates,
    onReloadTemplates,
    onPatchZoneTemplate,
    onUnbindZoneTemplate,
    onGoZonesTab,
    onGoSegmentsTab,
    onError,
  } = p;

  const zones = useMemo(() => detail.zones ?? [], [detail.zones]);

  const zonesActiveOnly = useMemo(() => zones.filter((z) => Boolean(z.active)), [zones]);

  const selectedZone = useMemo(() => {
    if (!selectedZoneId) return null;
    return zones.find((z) => z.id === selectedZoneId) ?? null;
  }, [zones, selectedZoneId]);

  const selectedZoneTemplateId = selectedZone?.segment_template_id ?? null;

  const [bindingTemplateId, setBindingTemplateId] = useState<string>("");

  useEffect(() => {
    if (!selectedZoneId || !selectedZone) {
      setBindingTemplateId("");
      return;
    }
    setBindingTemplateId(selectedZoneTemplateId != null ? String(selectedZoneTemplateId) : "");
  }, [selectedZoneId, selectedZone, selectedZoneTemplateId]);

  const canBindTemplate = useMemo(() => {
    if (disabled) return false;
    if (!selectedZoneId || !selectedZone) return false;
    if (templatesLoading) return false;
    if (!bindingTemplateId) return false;

    const tid = Number(bindingTemplateId);
    if (!Number.isFinite(tid) || tid <= 0) return false;

    // ✅ 候选池已收敛：activeTemplates 已由 hook 过滤为 “published 且未归档”
    const ok = activeTemplates.some((t) => t.id === tid);
    if (!ok) return false;

    if (selectedZoneTemplateId != null && tid === selectedZoneTemplateId) return false;

    return true;
  }, [activeTemplates, bindingTemplateId, disabled, selectedZone, selectedZoneId, selectedZoneTemplateId, templatesLoading]);

  async function onBind() {
    if (!selectedZoneId || !selectedZone) {
      onError("请先选择一个区域（Zone）");
      return;
    }
    const tid = Number(bindingTemplateId);
    if (!Number.isFinite(tid) || tid <= 0) {
      onError("请选择一个有效的重量段模板");
      return;
    }
    try {
      await onPatchZoneTemplate(selectedZoneId, tid);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "绑定重量段模板失败";
      onError(msg);
    }
  }

  // ✅ 绑定概览：收集所有 zone 已绑定的 template_id，加载详情用于摘要
  const zoneTemplateIds = useMemo(() => {
    const ids = new Set<number>();
    for (const z of zones) {
      const tid = z.segment_template_id ?? null;
      if (typeof tid === "number" && Number.isFinite(tid) && tid > 0) ids.add(tid);
    }
    return Array.from(ids.values());
  }, [zones]);

  const { detailById, loadingById, errById } = useTemplateDetailsLite(zoneTemplateIds);

  const templateNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of activeTemplates) {
      m.set(t.id, (t.name ?? "").trim() || `模板#${t.id}`);
    }
    return m;
  }, [activeTemplates]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">区域</div>
          <div className="mt-1 text-sm text-slate-600">
            先选 Zone，并为该 Zone 显式绑定一个已保存的重量段模板。区域范围（省份）与重量段方案都在本页维护。
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={disabled}
            onClick={onGoZonesTab}
            title="回到本页【区域】段（创建/编辑/省份范围等）"
          >
            回到区域
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={disabled}
            onClick={onGoSegmentsTab}
            title="回到本页【重量段方案】段（新建/编辑/保存/归档）"
          >
            回到重量段方案
          </button>
        </div>
      </div>

      <ZoneSelectCard
        busy={disabled}
        selectableZones={zonesActiveOnly}
        selectedZoneId={selectedZoneId}
        selectedZone={selectedZoneId ? zones.find((z) => z.id === selectedZoneId) ?? null : null}
        currentBracketsCount={0}
        onSelectZone={(zoneId) => {
          if (typeof zoneId === "number" && zoneId > 0) onSelectZone(zoneId);
        }}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-sm font-semibold text-slate-900">重量段模板绑定（必填）</div>
        <div className="mt-1 text-xs text-slate-600">
          绑定是 Zone 的事实：Zone 必须且只能绑定一个模板。候选模板仅包含“已保存且未归档”的模板。
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 disabled:opacity-60"
              disabled={disabled || templatesLoading || !selectedZoneId}
              value={bindingTemplateId}
              onChange={(e) => setBindingTemplateId(e.target.value)}
            >
              {!selectedZoneId ? <option value="">请先选择 Zone…</option> : <option value="">请选择已保存的模板…</option>}
              {activeTemplates.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {templateLabel(t)}
                </option>
              ))}
            </select>

            {templatesLoading ? <div className="mt-1 text-xs text-slate-500">正在加载模板列表…</div> : null}
            {templatesError ? <div className="mt-1 text-xs text-rose-700">模板列表加载失败：{templatesError}</div> : null}
            {selectedZoneId && !templatesLoading && !templatesError && activeTemplates.length === 0 ? (
              <div className="mt-1 text-xs text-slate-600">当前方案没有可用模板：请先在【重量段方案】中保存至少一个模板。</div>
            ) : null}

            {selectedZoneId ? (
              <div className="mt-1 text-xs text-slate-600">
                当前绑定：{" "}
                <span className="font-mono">{selectedZoneTemplateId == null ? "—" : `template_id=${selectedZoneTemplateId}`}</span>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-3">
            <button
              type="button"
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
              disabled={!canBindTemplate}
              onClick={() => void onBind()}
              title="将所选模板绑定到当前 Zone"
            >
              绑定模板
            </button>

            <button
              type="button"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              disabled={disabled || templatesLoading}
              onClick={onReloadTemplates}
              title="刷新模板列表"
            >
              刷新模板
            </button>
          </div>
        </div>
      </div>

      <BindingOverviewTable
        zones={zones}
        selectedZoneId={selectedZoneId}
        templateNameById={templateNameById}
        detailById={detailById}
        loadingById={loadingById}
        errById={errById}
        onUnbindZone={async (zoneId) => {
          try {
            await onUnbindZoneTemplate(zoneId);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "解除绑定失败";
            onError(msg);
            throw e;
          }
        }}
      />
    </div>
  );
};

export default ZoneCard;
