// src/features/admin/shipping-providers/scheme/brackets/QuoteMatrixCard.tsx
//
// 快递公司报价表（完整报价表）+ 单元格就地编辑
// - 标题：快递公司报价表
// - 去掉顶部说明
// - 去掉底部说明

import React, { useMemo, useState } from "react";
import type { PricingSchemeZone, PricingSchemeZoneBracket } from "../../api";
import { UI } from "../ui";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft, CellMode } from "./quoteModel";
import {
  keyFromSegment,
  keyFromBracket,
  segLabel,
  summarizeDraft,
  summarizeBracket,
  parseNum,
  defaultDraft,
} from "./quoteModel";

type EditingCell = {
  zoneId: number;
  key: string;
  min: number;
  max: number | null;
};

export const QuoteMatrixCard: React.FC<{
  busy: boolean;
  segments: WeightSegment[];
  zonesForTable: PricingSchemeZone[];
  selectedZoneId: number | null;
  bracketsByZoneId: Record<number, PricingSchemeZoneBracket[]>;
  draftsByZoneId: Record<number, Record<string, RowDraft>>;
  onUpsertCell: (args: { zoneId: number; min: number; max: number | null; draft: RowDraft }) => Promise<void>;
}> = ({
  busy,
  segments,
  zonesForTable,
  selectedZoneId,
  bracketsByZoneId,
  draftsByZoneId,
  onUpsertCell,
}) => {
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
    if (!col.valid || !col.key) return;

    const rowDrafts = draftsByZoneId[zoneId] ?? {};
    const d = rowDrafts[col.key] ?? null;

    if (d) {
      setEditingDraft(d);
    } else {
      setEditingDraft(defaultDraft());
    }

    setEditing({ zoneId, key: col.key, min: col.min, max: col.max });
  }

  async function saveEditor() {
    if (!editing) return;
    await onUpsertCell({
      zoneId: editing.zoneId,
      min: editing.min,
      max: editing.max,
      draft: editingDraft,
    });
    setEditing(null);
  }

  return (
    <div className={UI.cardTight}>
      <div className={UI.sectionTitle}>快递公司报价表</div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b px-3 py-2 text-left text-xs text-slate-500">区域</th>
              {columns.map((c, idx) => (
                <th key={idx} className="border-b px-3 py-2 text-center text-xs font-mono text-slate-700">
                  {segLabel(c.seg)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {zonesForTable.map((z) => {
              const rowBrackets = bracketsByZoneId[z.id] ?? (z.brackets ?? []);
              const rowBracketByKey: Record<string, PricingSchemeZoneBracket> = {};
              for (const b of rowBrackets) rowBracketByKey[keyFromBracket(b)] = b;

              const rowDrafts = draftsByZoneId[z.id] ?? {};
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
                        <td key={idx} className="px-3 py-3 text-center text-xs text-red-600">
                          区间非法
                        </td>
                      );
                    }

                    const d = rowDrafts[c.key];
                    const b = rowBracketByKey[c.key];

                    const isEditing = !!editing && editing.zoneId === z.id && editing.key === c.key;
                    const text = d ? summarizeDraft(d) : b ? summarizeBracket(b) : "未设";

                    return (
                      <td key={idx} className="px-2 py-2 align-top">
                        <div className="group relative flex justify-center">
                          {!isEditing ? (
                            <div className="flex items-start gap-2">
                              <div className={`mt-1 text-xs ${text === "未设" ? "text-slate-400" : "text-slate-800"}`}>
                                {text}
                              </div>

                              <button
                                type="button"
                                className="invisible group-hover:visible rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                                disabled={busy}
                                onClick={() => openEditor(z.id, c)}
                                title="编辑"
                              >
                                ✏️
                              </button>
                            </div>
                          ) : (
                            <div className="w-[240px] rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <select
                                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                                  value={editingDraft.mode}
                                  disabled={busy}
                                  onChange={(e) => {
                                    const mode = e.target.value as CellMode;
                                    if (mode === "flat") {
                                      setEditingDraft((p) => ({
                                        ...p,
                                        mode: "flat",
                                        flatAmount: p.flatAmount ?? "",
                                      }));
                                    } else if (mode === "linear_total") {
                                      setEditingDraft((p) => ({
                                        ...p,
                                        mode: "linear_total",
                                        baseAmount: p.baseAmount || "",
                                        ratePerKg: p.ratePerKg || "",
                                        baseKg: p.baseKg || "1",
                                        flatAmount: "",
                                      }));
                                    } else {
                                      setEditingDraft((p) => ({ ...p, mode: "manual" }));
                                    }
                                  }}
                                >
                                  <option value="linear_total">票费 + 元/kg</option>
                                  <option value="flat">固定价</option>
                                  <option value="manual">人工</option>
                                </select>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                    disabled={busy}
                                    onClick={() => void saveEditor()}
                                    title="保存"
                                  >
                                    ✅
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:opacity-60"
                                    disabled={busy}
                                    onClick={() => setEditing(null)}
                                    title="取消"
                                  >
                                    ❌
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2">
                                {editingDraft.mode === "flat" ? (
                                  <input
                                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                                    placeholder="金额"
                                    value={editingDraft.flatAmount}
                                    disabled={busy}
                                    onChange={(e) => setEditingDraft((p) => ({ ...p, flatAmount: e.target.value }))}
                                  />
                                ) : editingDraft.mode === "linear_total" ? (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-slate-500">票费</span>
                                    <input
                                      className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
                                      placeholder="每票"
                                      value={editingDraft.baseAmount}
                                      disabled={busy}
                                      onChange={(e) => setEditingDraft((p) => ({ ...p, baseAmount: e.target.value }))}
                                    />
                                    <span className="text-slate-500">单价</span>
                                    <input
                                      className="w-20 rounded border border-slate-300 px-2 py-1 font-mono"
                                      placeholder="元/kg"
                                      value={editingDraft.ratePerKg}
                                      disabled={busy}
                                      onChange={(e) => setEditingDraft((p) => ({ ...p, ratePerKg: e.target.value }))}
                                    />
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400">人工/未设</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
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
