// src/features/admin/shipping-providers/scheme/table/cards/PricingEditorCard.tsx

import React from "react";
import SegmentTemplateMatrixTable from "../../brackets/SegmentTemplateMatrixTable";
import type { ZoneBracketsMatrixGroup } from "../../brackets/matrix/types";
import type { RowDraft } from "../../brackets/quoteModel";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function readNum(v: unknown, k: string): number | null {
  if (!isRecord(v)) return null;
  const x = v[k];
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

export const PricingEditorCard: React.FC<{
  disabled: boolean;

  mxLoading: boolean;
  mxError: string | null;
  groups: ZoneBracketsMatrixGroup[];

  selectedZoneId: number | null;
  busy: boolean;

  onReload: () => void;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;

  // ✅ 新增：点击“修改”回到上方批量录价
  onRequestEditZone?: (zoneId: number) => void;
}> = (p) => {
  const { disabled, mxLoading, mxError, groups, selectedZoneId, busy, onReload, onUpsertCell, onRequestEditZone } = p;

  function groupKey(g: ZoneBracketsMatrixGroup): string {
    const id = readNum(g, "segment_template_id");
    return id != null ? String(id) : JSON.stringify(g);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900">综合报价表（只读）</div>
        <div className="mt-1 text-sm text-slate-600">
          用于核对各区域在各重量段下的报价覆盖情况；如需修改，请使用行尾【修改】回到“按区域批量录价”。
        </div>
      </div>

      {mxLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">正在加载报价矩阵（matrix）…</div>
      ) : mxError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">报价矩阵加载失败</div>
          <div className="mt-1 text-rose-900/80">{mxError}</div>
          <div className="mt-3">
            <button
              type="button"
              className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-50"
              onClick={onReload}
            >
              重试加载
            </button>
          </div>
        </div>
      ) : (groups?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          matrix 返回为空：当前方案下暂无可展示的报价表分组（groups=[]）。
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <SegmentTemplateMatrixTable
              key={groupKey(g)}
              group={g}
              busy={busy || disabled}
              selectedZoneId={selectedZoneId}
              onUpsertCell={onUpsertCell}
              readonly={true}
              onRequestEditZone={onRequestEditZone}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PricingEditorCard;
