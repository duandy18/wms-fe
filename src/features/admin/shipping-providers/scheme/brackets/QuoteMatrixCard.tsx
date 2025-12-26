// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard.tsx
//
// 快递公司报价表（完整报价表）+ 单元格就地编辑
// - 方案级口径：scheme.default_pricing_mode 作为默认值（不是硬约束）
// - 单元格允许选择计价模型（混合口径）
// - 允许少量格子设为 manual_quote（人工/未设）作为兜底
//
// ✅ 录价可发现性增强（v1）：
// - 单元格整块可点击（不再依赖 hover）
// - 未设：直接显示「点击录价」
// - 每格始终显示「录价」按钮（更明确）

import React, { useMemo } from "react";
import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import type { SchemeDefaultPricingMode } from "../../api/types";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";

import QuoteMatrixTable from "./QuoteMatrixTable";
import QuoteCellEditor from "./QuoteCellEditor";
import { buildColumns, type QuoteColumn, columnLabel } from "./quoteMatrixUtils";
import { useQuoteMatrixEditor } from "./useQuoteMatrixEditor";
import { PUI } from "./ui";

function modeLabel(m: SchemeDefaultPricingMode): string {
  if (m === "flat") return "固定价";
  if (m === "step_over") return "首重 + 续重";
  return "票费 + 元/kg";
}

export const QuoteMatrixCard: React.FC<{
  busy: boolean;
  schemeMode: SchemeDefaultPricingMode;
  segments: WeightSegment[];
  zonesForTable: PricingSchemeZone[];
  selectedZoneId: number | null;
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;

  // ✅ Phase 4.3：当没有 segments（表头）时禁用表格编辑
  disabled?: boolean;
}> = ({
  busy,
  schemeMode,
  segments,
  zonesForTable,
  selectedZoneId,
  bracketsByZoneId,
  draftsByZoneId,
  onUpsertCell,
  disabled,
}) => {
  const hardDisabled = !!disabled;

  const columns = useMemo<QuoteColumn[]>(() => buildColumns(segments), [segments]);
  const safeZonesForTable = useMemo(() => (Array.isArray(zonesForTable) ? zonesForTable : []), [zonesForTable]);

  const editor = useQuoteMatrixEditor({
    schemeMode,
    busy,
    disabled: hardDisabled,
    draftsByZoneId,
    onUpsertCell,
  });

  return (
    <div className={PUI.card}>
      <div className="flex items-center justify-between gap-3">
        <div className={PUI.title}>快递公司报价表（核对与补录）</div>
        <div className={PUI.hint}>
          默认口径：<span className="font-mono">{modeLabel(schemeMode)}</span>（单元格里可切换计价模型）
        </div>
      </div>

      {hardDisabled ? (
        <div className={PUI.warnBox}>当前报价表头（重量分段）尚未配置或为空：请先维护并保存“重量分段”，再进行录价。</div>
      ) : (
        <div className={PUI.infoBox}>录价方式：点击单元格即可输入价格；计价模型可在弹层内选择；复制功能在上方卡片。</div>
      )}

      <div className="mt-3">
        <QuoteMatrixTable
          columns={columns}
          zones={safeZonesForTable}
          selectedZoneId={selectedZoneId}
          schemeMode={schemeMode}
          busy={busy}
          disabled={hardDisabled}
          bracketsByZoneId={bracketsByZoneId}
          draftsByZoneId={draftsByZoneId}
          editingKey={editor.editingKey}
          onOpenEditor={editor.openEditor}
          renderEditor={({ zone, col }) => (
            <QuoteCellEditor
              zoneName={zone.name}
              segmentLabel={columnLabel(col)}
              schemeMode={schemeMode}
              busy={busy}
              disabled={hardDisabled}
              draft={editor.editingDraft}
              onChangeDraft={editor.setEditingDraft}
              onSave={() => void editor.saveEditor()}
              onCancel={editor.cancelEditor}
            />
          )}
        />
      </div>
    </div>
  );
};

export default QuoteMatrixCard;
