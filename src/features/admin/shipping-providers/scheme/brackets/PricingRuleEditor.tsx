// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditor.tsx
//
// 重量分段（报价表表头）编辑器
// - locked：只读展示
// - always：可编辑（新增/删除/修改）
//
// 格式打磨：
// - 行距更紧凑（适合工作台）
// - 标题层级更清晰
// - 数值列保持 mono，便于扫读

import React, { useMemo } from "react";

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

  function updateRow(idx: number, patch: Partial<WeightSegment>) {
    if (!editable) return;
    onChange(rows.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }

  function deleteRow(idx: number) {
    if (!editable) return;
    const ok = window.confirm("确认删除该重量分段？");
    if (!ok) return;
    onChange(rows.filter((_, i) => i !== idx));
  }

  function appendRow() {
    if (!editable) return;
    onChange([...(rows ?? []), { min: "", max: "" }]);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[15px] font-semibold text-slate-800">重量分段</div>

      <div className="mt-3 space-y-1.5">
        {rows.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-[6px]"
          >
            <div className="min-w-[110px] text-xs font-mono text-slate-600">{labelOf(s)}</div>

            <input
              className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                editable ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
              value={s.min}
              placeholder="from"
              readOnly={!editable}
              onChange={(e) => updateRow(idx, { min: e.target.value })}
            />

            <span className="text-slate-400 text-sm">～</span>

            <input
              className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                editable ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
              value={s.max}
              placeholder="to / ∞"
              readOnly={!editable}
              onChange={(e) => updateRow(idx, { max: e.target.value })}
            />

            <span className="text-xs text-slate-400">kg</span>

            {editable ? (
              <button
                type="button"
                className="ml-auto text-xs text-red-600 hover:underline"
                onClick={() => deleteRow(idx)}
              >
                删除
              </button>
            ) : (
              <span className="ml-auto text-xs text-slate-400">—</span>
            )}
          </div>
        ))}

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
