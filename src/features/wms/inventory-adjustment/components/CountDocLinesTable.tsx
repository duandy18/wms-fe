import React from "react";
import {
  formatQty,
  formatQtyWithUnit,
  type CountDocExecutionLineOut,
} from "../contracts/countDoc";

export type CountDocLineDraft = {
  counted_qty_input: string;
};

type Props = {
  lines: CountDocExecutionLineOut[];
  draftsByLineId: Record<number, CountDocLineDraft>;
  interactionDisabled: boolean;
  onChangeDraft: (lineId: number, patch: Partial<CountDocLineDraft>) => void;
};

function numberText(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return n;
}

function diffClass(diff: number | null): string {
  if (diff == null) return "text-slate-900";
  if (diff > 0) return "text-emerald-700";
  if (diff < 0) return "text-rose-700";
  return "text-slate-900";
}

const CountDocLinesTable: React.FC<Props> = ({
  lines,
  draftsByLineId,
  interactionDisabled,
  onChangeDraft,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">盘点行</div>
        <div className="text-xs text-slate-500">当前统一按基础单位录入实盘数量。</div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">行号</th>
              <th className="px-3 py-2 text-left">商品</th>
              <th className="px-3 py-2 text-left">规格</th>
              <th className="px-3 py-2 text-left">基础单位</th>
              <th className="px-3 py-2 text-right">快照数量</th>
              <th className="px-3 py-2 text-right">实盘数量</th>
              <th className="px-3 py-2 text-right">差异</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  当前盘点单暂无盘点行
                </td>
              </tr>
            ) : (
              lines.map((line) => {
                const draft = draftsByLineId[line.id] ?? {
                  counted_qty_input: "",
                };

                const qtyInput = numberText(draft.counted_qty_input);
                const previewCountedQty =
                  qtyInput != null ? qtyInput : line.counted_qty_base;
                const previewDiff =
                  qtyInput != null ? qtyInput - line.snapshot_qty_base : line.diff_qty_base;

                return (
                  <tr key={line.id} className="align-top text-slate-800">
                    <td className="px-3 py-2 font-mono">{line.line_no}</td>
                    <td className="px-3 py-2">
                      {line.item_name_snapshot || `商品 ${line.item_id}`}
                    </td>
                    <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                    <td className="px-3 py-2">{line.base_uom_name || "-"}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {formatQtyWithUnit(line.snapshot_qty_base, line.base_uom_name)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-right text-sm"
                          value={draft.counted_qty_input}
                          disabled={interactionDisabled}
                          placeholder="0"
                          onChange={(e) => {
                            onChangeDraft(line.id, {
                              counted_qty_input: e.target.value,
                            });
                          }}
                        />
                        <span className="min-w-[2rem] text-left text-xs text-slate-500">
                          {line.base_uom_name || ""}
                        </span>
                      </div>
                      {previewCountedQty != null ? (
                        <div className="mt-1 text-xs text-slate-500">
                          {formatQty(previewCountedQty)}
                        </div>
                      ) : null}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${diffClass(previewDiff)}`}>
                      {formatQtyWithUnit(previewDiff, line.base_uom_name)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CountDocLinesTable;
