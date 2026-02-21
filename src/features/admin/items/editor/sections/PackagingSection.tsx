// src/features/admin/items/editor/sections/PackagingSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

function effectiveUom(vm: ItemEditorVm): string {
  const { form } = vm;
  return form.uom_mode === "preset" ? form.uom_preset.trim() : form.uom_custom.trim();
}

function parsePositiveInt(text: string): number | null {
  const t = (text ?? "").trim();
  if (!t) return null;
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  const i = Math.trunc(n);
  if (i < 1) return null;
  return i;
}

const PackagingSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  const baseUom = effectiveUom(vm);
  const ratio = parsePositiveInt(form.case_ratio);

  const ratioTouched = form.case_ratio.trim().length > 0;
  const ratioInvalid = ratioTouched && ratio === null;

  const packUom = form.case_uom.trim() || "箱";
  const equation = ratio !== null && baseUom ? `1${packUom} = ${ratio}${baseUom}` : null;

  return (
    <div className="rounded border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold">单位换算</div>
          <div className="mt-1 text-sm text-slate-600">结构化表达：1箱 = 12袋（不改变系统事实口径）</div>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-600">当前换算</div>
          <div className="mt-1 font-mono text-sm">{equation ?? <span className="text-slate-400">—</span>}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <div className="text-sm font-medium">单位换算（整数）</div>
          <input
            className={[
              "mt-1 w-full rounded border px-3 py-2 text-base font-mono",
              ratioInvalid ? "border-red-300" : "border-slate-200",
            ].join(" ")}
            placeholder="例如：12（留空=未治理）"
            value={form.case_ratio}
            onChange={(e) => setForm({ ...form, case_ratio: e.target.value })}
            disabled={vm.saving}
            inputMode="numeric"
          />
          <FieldError msg={fieldErrors.case_ratio} />
          {!fieldErrors.case_ratio && ratioTouched && ratioInvalid ? (
            <div className="mt-1 text-xs text-red-600">请输入 ≥ 1 的整数</div>
          ) : null}
          {!fieldErrors.case_ratio && !ratioTouched ? (
            <div className="mt-1 text-xs text-amber-700">未配置（后续质量面板可提示）</div>
          ) : null}
        </div>

        <div>
          <div className="text-sm font-medium">包装单位（可选）</div>
          <input
            className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-base"
            placeholder="默认：箱"
            value={form.case_uom}
            onChange={(e) => setForm({ ...form, case_uom: e.target.value })}
            disabled={vm.saving}
          />
          <div className="mt-1 text-xs text-slate-500">留空仅影响展示，默认显示“箱”</div>
        </div>

        <div>
          <div className="text-sm font-medium">最小单位（事实口径）</div>
          <div className="mt-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-base">
            <span className="font-mono">{baseUom || "—"}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">先设置最小单位，再配置单位换算</div>
        </div>
      </div>
    </div>
  );
};

export default PackagingSection;
