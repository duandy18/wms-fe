// src/features/admin/shipping-providers/scheme/overview/SchemeOverviewPanel.tsx
//
// 总览/导出（只读）
// - 用于审核/交接/核对：看覆盖率、看未设/人工兜底数量
// - 导出 CSV：给对账/合同/留底

import React, { useMemo } from "react";
import type { PricingSchemeDetail } from "../../api";
import { exportSchemeCsv } from "./exportCsv";
import { UI } from "../ui";

type Coverage = {
  zonesTotal: number;
  zonesActive: number;
  segmentsTotal: number;
  bracketsTotal: number;
  manualTotal: number;
  unsetEstimate: number;
};

function lower(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

export const SchemeOverviewPanel: React.FC<{ detail: PricingSchemeDetail }> = ({ detail }) => {
  const cov = useMemo<Coverage>(() => {
    const zones = detail.zones ?? [];
    const zonesTotal = zones.length;

    // PricingSchemeZone 在 api/types.ts 里明确有 active:boolean
    const zonesActive = zones.filter((z) => z.active).length;

    // PricingSchemeDetail 继承 PricingScheme，已包含 segments_json?: SchemeWeightSegment[] | null
    const segmentsTotal = Array.isArray(detail.segments_json) ? detail.segments_json.length : 0;

    let bracketsTotal = 0;
    let manualTotal = 0;

    for (const z of zones) {
      const bs = z.brackets ?? [];
      bracketsTotal += bs.length;
      for (const b of bs) {
        if (lower(b.pricing_mode) === "manual_quote") manualTotal += 1;
      }
    }

    // “未设格子估算”：启用 zones × segments - 已有 brackets（粗略核对用）
    const unsetEstimate = Math.max(0, zonesActive * segmentsTotal - bracketsTotal);

    return { zonesTotal, zonesActive, segmentsTotal, bracketsTotal, manualTotal, unsetEstimate };
  }, [detail]);

  return (
    <div className={UI.overviewWrap}>
      <div className={UI.cardTight}>
        <div className={UI.panelTitle}>总览/导出（只读）</div>
        <div className={`mt-1 ${UI.panelHint}`}>用于核对配置完整性、人工兜底数量，并导出 CSV 给对账/合同/留底。</div>

        <div className={UI.overviewGrid}>
          <div className={UI.overviewStatCard}>
            <div className={UI.overviewStatLabel}>区域（Zone）总数</div>
            <div className={UI.overviewStatValue}>{cov.zonesTotal}</div>
            <div className={UI.overviewStatSub}>启用：{cov.zonesActive}</div>
          </div>

          <div className={UI.overviewStatCard}>
            <div className={UI.overviewStatLabel}>重量区间（表头）</div>
            <div className={UI.overviewStatValue}>{cov.segmentsTotal}</div>
            <div className={UI.overviewStatSub}>来自 segments_json</div>
          </div>

          <div className={UI.overviewStatCard}>
            <div className={UI.overviewStatLabel}>已录入报价（brackets）</div>
            <div className={UI.overviewStatValue}>{cov.bracketsTotal}</div>
            <div className={UI.overviewStatSub}>含所有口径</div>
          </div>

          <div className={UI.overviewStatCard}>
            <div className={UI.overviewStatLabel}>人工兜底（manual）</div>
            <div className={UI.overviewStatValue}>{cov.manualTotal}</div>
            <div className={UI.overviewStatSub}>建议尽量清零</div>
          </div>

          <div className={UI.overviewStatCard}>
            <div className={UI.overviewStatLabel}>未设估算（启用区×段 - 已录）</div>
            <div className={UI.overviewStatValue}>{cov.unsetEstimate}</div>
            <div className={UI.overviewStatSub}>用于快速核对</div>
          </div>
        </div>

        <div className={UI.overviewFooterRow}>
          <div className={UI.overviewFooterHint}>
            导出字段：zone/重量段/pricing_mode/金额字段/active 等，便于外部核对与留档。
          </div>

          <button type="button" className={UI.overviewExportBtn} onClick={() => exportSchemeCsv(detail)}>
            导出 CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeOverviewPanel;
