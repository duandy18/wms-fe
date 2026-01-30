// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard/index.tsx

import React, { useMemo, useState } from "react";
import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../../api";
import { UI } from "../../ui";
import type { WeightSegment } from "../PricingRuleEditor";
import type { RowDraft } from "../quoteModel";
import { keyFromSegment, keyFromBracket, segLabel, parseNum, defaultDraft } from "../quoteModel";

import type { EditingCell } from "./types";
import { displayTextFromBackend } from "./helpers";
import { initDraftFromBackend } from "./editor";
import { CellEditorPopover } from "./CellEditorPopover";

export const QuoteMatrixCard: React.FC<{
  busy: boolean;
  segments: WeightSegment[];
  zonesForTable: PricingSchemeZone[];
  selectedZoneId: number | null;
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;

  // ✅ 新增：只读模式（综合展示表不再允许逐格编辑）
  readonly?: boolean;

  // ✅ 新增：行操作（回到“按 Zone 批量录价”去修改）
  onRequestEditZone?: (zoneId: number) => void;
}> = ({
  busy,
  segments,
  zonesForTable,
  selectedZoneId,
  bracketsByZoneId,
  draftsByZoneId,
  onUpsertCell,
  readonly,
  onRequestEditZone,
}) => {
  // draftsByZoneId 不再用于矩阵展示（严格后端对齐）；保留 prop 形状避免牵连
  void draftsByZoneId;

  const isReadonly = !!readonly;

  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [editingDraft, setEditingDraft] = useState<RowDraft>(defaultDraft());

  const columns = useMemo(() => {
    return segments.map((s) => {
      const key = keyFromSegment(s);
      const min = parseNum(s.min.trim());
      const max = s.max.trim() ? parseNum(s.max.trim()) : null;
      const valid = !!key && min != null && (max == null || max > min);
      return { seg: s, key, min: min ?? 0, max: max ?? null, valid };
    });
  }, [segments]);

  function openEditor(zoneId: number, col: (typeof columns)[number]) {
    if (isReadonly) return;
    if (busy) return;
    if (!col.valid || !col.key) return;

    setEditingDraft(
      initDraftFromBackend({
        zoneId,
        key: col.key,
        bracketsByZoneId,
      }),
    );

    setEditing({ zoneId, key: col.key, min: col.min, max: col.max });
  }

  async function saveEditor() {
    if (!editing) return;

    if (editingDraft.mode === "manual") {
      alert("该单元格处于“需补录”状态，请先选择可自动算价的计价方式。");
      return;
    }

    await onUpsertCell({
      zoneId: editing.zoneId,
      min: editing.min,
      max: editing.max,
      draft: editingDraft,
    });

    setEditing(null);
  }

  const showOps = typeof onRequestEditZone === "function";

  return (
    <div className={UI.cardTight}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={UI.sectionTitle}>快递公司报价表</div>
          <div className="mt-1 text-sm text-slate-600">
            {isReadonly ? "只读展示：用于核对各区域在各重量段下的报价覆盖情况。" : "可逐格编辑：用于补录或修正单个单元格。"}
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b px-3 py-2 text-left text-sm text-slate-600">区域</th>

              {columns.map((c, idx) => (
                <th key={idx} className="border-b px-3 py-2 text-center text-sm font-mono text-slate-700">
                  {segLabel(c.seg)}
                </th>
              ))}

              {showOps ? (
                <th className="border-b px-3 py-2 text-center text-sm text-slate-600">操作</th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {zonesForTable.map((z) => {
              const rowBrackets = bracketsByZoneId[z.id] ?? (z.brackets ?? []);
              const rowBracketByKey: Record<string, PricingSchemeZoneBracket> = {};
              for (const b of rowBrackets) rowBracketByKey[keyFromBracket(b)] = b;

              const isCurrent = selectedZoneId === z.id;

              return (
                <tr key={z.id} className={isCurrent ? "bg-amber-50" : "bg-white"}>
                  <td className="px-3 py-3 text-sm font-mono text-slate-900">
                    {z.name}
                    {isCurrent ? <span className="ml-2 text-xs text-amber-700">（当前）</span> : null}
                  </td>

                  {columns.map((c, idx) => {
                    if (!c.valid || !c.key) {
                      return (
                        <td key={idx} className="px-3 py-3 text-center text-sm text-red-600">
                          区间非法
                        </td>
                      );
                    }

                    const b = rowBracketByKey[c.key];
                    const isEditing = !!editing && editing.zoneId === z.id && editing.key === c.key;
                    const dt = displayTextFromBackend(b);

                    return (
                      <td key={idx} className="px-2 py-2 align-top">
                        <div className="group relative flex justify-center">
                          {!isEditing ? (
                            <div className="flex items-start gap-2">
                              <div
                                className={`mt-1 text-sm ${
                                  dt.tone === "empty"
                                    ? "text-slate-400"
                                    : dt.tone === "warn"
                                      ? "text-red-600"
                                      : "text-slate-800"
                                }`}
                              >
                                {dt.text}
                              </div>

                              {/* ✅ 非只读模式才允许逐格编辑 */}
                              {!isReadonly ? (
                                <button
                                  type="button"
                                  className="invisible group-hover:visible rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                                  disabled={busy}
                                  onClick={() => openEditor(z.id, c)}
                                  title="编辑"
                                >
                                  ✏️
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <CellEditorPopover
                              busy={busy}
                              draft={editingDraft}
                              setDraft={setEditingDraft}
                              onSave={() => void saveEditor()}
                              onCancel={() => setEditing(null)}
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {showOps ? (
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        disabled={busy}
                        onClick={() => onRequestEditZone?.(z.id)}
                        title="回到上方“按区域批量录价”进行修改"
                      >
                        修改
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteMatrixCard;
