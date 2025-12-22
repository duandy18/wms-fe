// src/features/admin/shipping-providers/scheme/brackets/PricingRuleEditor.tsx
//
// 重量分段（报价表表头）
// - 默认锁定：防误删/误改（表头一旦确定应保持稳定）
// - 只有点“编辑”才允许修改/新增/删除
// - 保存后自动退出编辑模式
// - 自动回显由 BracketsPanel 负责；这里不提供“加载”按钮（避免误覆盖）

import React, { useMemo, useState } from "react";

export type WeightSegment = {
  min: string;
  max: string; // 空 = ∞
};

function storageKey(schemeId: number): string {
  return `WMS_SCHEME_WEIGHT_TEMPLATE_${schemeId}`;
}

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
}> = ({ schemeId, value, onChange }) => {
  const key = useMemo(() => storageKey(schemeId), [schemeId]);

  // ✅ 默认锁定：必须点“编辑”才能动表头
  const [editing, setEditing] = useState(false);

  const canSave = useMemo(() => value.some((x) => (x.min ?? "").trim()), [value]);

  function handleSave() {
    if (!canSave) {
      alert("至少填写一条重量分段（from 必填）");
      return;
    }

    const ok = window.confirm(
      "确认保存重量分段？\n\n保存后将作为报价表表头使用，建议确认无误再保存。",
    );
    if (!ok) return;

    localStorage.setItem(key, JSON.stringify(value, null, 2));
    setEditing(false);
    alert("已保存重量分段（默认已锁定，需点“编辑”才能再修改）");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">重量分段</div>
          <div className="mt-1 text-xs text-slate-500">
            这是报价表表头（列）。为避免误操作，默认锁定；需要调整请先点“编辑”。
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              editing
                ? "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
            }`}
            onClick={() => setEditing((v) => !v)}
            title={editing ? "退出编辑（不保存）" : "进入编辑（允许改动表头）"}
          >
            {editing ? "退出编辑" : "编辑"}
          </button>

          <button
            type="button"
            disabled={!editing || !canSave}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              editing && canSave
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 bg-slate-100 text-slate-400"
            }`}
            onClick={handleSave}
            title={!editing ? "先点“编辑”再保存" : "保存并锁定"}
          >
            保存
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {value.map((s, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <div className="min-w-[110px] text-xs font-mono text-slate-600">
              {labelOf(s)}
            </div>

            <input
              className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                editing ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
              value={s.min}
              placeholder="from"
              disabled={!editing}
              onChange={(e) =>
                onChange(value.map((x, i) => (i === idx ? { ...x, min: e.target.value } : x)))
              }
            />

            <span className="text-slate-400">～</span>

            <input
              className={`w-24 rounded border px-2 py-1 text-sm font-mono ${
                editing ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
              value={s.max}
              placeholder="to / ∞"
              disabled={!editing}
              onChange={(e) =>
                onChange(value.map((x, i) => (i === idx ? { ...x, max: e.target.value } : x)))
              }
            />

            <span className="text-xs text-slate-400">kg</span>

            {/* 删除按钮只在编辑模式出现 */}
            {editing ? (
              <button
                type="button"
                className="ml-auto text-xs text-red-600 hover:underline"
                onClick={() => {
                  const ok = window.confirm("确认删除该重量分段？\n\n删除后请记得保存。");
                  if (!ok) return;
                  onChange(value.filter((_, i) => i !== idx));
                }}
              >
                删除
              </button>
            ) : (
              <span className="ml-auto text-xs text-slate-400">已锁定</span>
            )}
          </div>
        ))}

        {/* 新增按钮只在编辑模式出现 */}
        {editing ? (
          <button
            type="button"
            className="mt-2 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            onClick={() => onChange([...value, { min: "", max: "" }])}
          >
            + 新增重量分段
          </button>
        ) : null}
      </div>

      <div className="mt-3 text-xs text-slate-500">
        小提示：表头稳定后，日常改价请在底部“快递公司报价表”里编辑单元格（✏️）。
      </div>
    </div>
  );
};

export default PricingRuleEditor;
