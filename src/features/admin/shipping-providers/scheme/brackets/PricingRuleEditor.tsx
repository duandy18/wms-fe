// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditor.tsx
//
// 重量分段编辑器（可编辑 / 可只读）
// - mode="locked"：只读展示
// - mode="always"：允许新增/删除/修改
//
// 说明：
// - “重量段方案”页（TemplateWorkbenchDraftSection）会传 mode="always"
// - 其它位置如需只读展示，保持默认 locked 即可

import React, { useMemo, useState } from "react";

export type WeightSegment = {
  min: string;
  max: string; // 空 = ∞
};

function labelOf(s: WeightSegment): string {
  const min = (s.min ?? "").trim();
  const max = (s.max ?? "").trim();
  if (!min) return "未定义";
  if (!max) return `${min}kg+`;
  return `${min}–${max}kg`;
}

export const PricingRuleEditor: React.FC<{
  schemeId: number;
  value: WeightSegment[];
  onChange: (next: WeightSegment[]) => void;
  dirty?: boolean;
  mode?: "locked" | "always";
}> = ({ value, onChange, mode = "locked" }) => {
  const rows = useMemo(() => value ?? [], [value]);
  const editable = mode === "always";

  // 行内轻量确认：避免 window.confirm 的“系统级惊吓感”
  const [pendingDeleteIdx, setPendingDeleteIdx] = useState<number | null>(null);

  function updateRow(idx: number, patch: Partial<WeightSegment>) {
    if (!editable) return;
    onChange(rows.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  function requestDeleteRow(idx: number) {
    if (!editable) return;
    setPendingDeleteIdx(idx);
  }

  function cancelDeleteRow() {
    setPendingDeleteIdx(null);
  }

  function confirmDeleteRow(idx: number) {
    if (!editable) return;
    onChange(rows.filter((_, i) => i !== idx));
    setPendingDeleteIdx(null);
  }

  function appendRow() {
    if (!editable) return;
    onChange([...(rows ?? []), { min: "", max: "" }]);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[15px] font-semibold text-slate-800">重量分段</div>
        <span className="text-xs text-slate-500">{editable ? "可编辑" : "只读"}</span>
      </div>

      <div className="mt-3 space-y-1.5">
        {rows.map((s, idx) => {
          const isPending = pendingDeleteIdx === idx;

          return (
            <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-[6px]">
              <div className="flex items-center gap-3">
                <div className="min-w-[110px] text-xs font-mono text-slate-600">{labelOf(s)}</div>

                <input
                  className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                    editable ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
                  }`}
                  value={s.min}
                  placeholder="起"
                  readOnly={!editable}
                  onChange={(e) => updateRow(idx, { min: e.target.value })}
                />

                <span className="text-slate-400 text-sm">～</span>

                <input
                  className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                    editable ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
                  }`}
                  value={s.max}
                  placeholder="止 / ∞"
                  readOnly={!editable}
                  onChange={(e) => updateRow(idx, { max: e.target.value })}
                />

                <span className="text-xs text-slate-400">kg</span>

                {editable ? (
                  <button
                    type="button"
                    className="ml-auto text-xs text-slate-600 hover:underline"
                    onClick={() => requestDeleteRow(idx)}
                  >
                    删除
                  </button>
                ) : (
                  <span className="ml-auto text-xs text-slate-400">—</span>
                )}
              </div>

              {editable && isPending ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <div className="text-xs text-slate-600">
                    <span className="font-medium text-slate-800">删除重量分段：</span>
                    <span className="font-mono">{labelOf(s)}</span>
                    <span className="text-slate-400"> · </span>
                    <span className="text-slate-500">仅影响当前重量段方案的结构，不会影响已生效运价。</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      onClick={cancelDeleteRow}
                    >
                      取消
                    </button>

                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
                      onClick={() => confirmDeleteRow(idx)}
                    >
                      确认删除
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {editable ? (
          <button
            type="button"
            className="mt-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            onClick={appendRow}
          >
            + 新增重量分段
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PricingRuleEditor;
