// src/features/admin/items/editor/sections/UomAndWeightSection.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

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

const UOM_PRESETS = ["PCS", "袋", "包", "罐", "瓶", "箱", "件"];
const PACK_UOM_PRESETS = ["箱", "盒", "件", "包", "袋", "瓶", "罐"];

function norm(s: string): string {
  return (s ?? "").trim();
}

type PackUomMode = "select" | "custom";

const UomAndWeightSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  const ratio = parsePositiveInt(form.case_ratio);
  const ratioTouched = norm(form.case_ratio).length > 0;
  const ratioInvalid = ratioTouched && ratio === null;

  // --- 包装单位：select + custom 输入（不引入新字段，使用本地 UI 状态解决 __CUSTOM__ 回弹） ---
  const caseUomText = norm(form.case_uom);

  const initialPackMode: PackUomMode = useMemo(() => {
    if (!caseUomText) return "select";
    if (PACK_UOM_PRESETS.includes(caseUomText)) return "select";
    return "custom";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [packMode, setPackMode] = useState<PackUomMode>(initialPackMode);

  useEffect(() => {
    // 当外部（如选中 item）切换导致 case_uom 变化时，自动校正 packMode
    const v = norm(form.case_uom);
    if (!v) {
      if (packMode !== "select") setPackMode("select");
      return;
    }
    if (PACK_UOM_PRESETS.includes(v)) {
      if (packMode !== "select") setPackMode("select");
      return;
    }
    if (packMode !== "custom") setPackMode("custom");
  }, [form.case_uom, packMode]);

  // --- 最小单位：select + custom 输入（沿用既有 uom_mode） ---
  const uomSelectValue = form.uom_mode === "preset" ? form.uom_preset : "__CUSTOM__";

  const commonInput = "w-full rounded border px-3 py-2 text-base";
  const monoInput = "w-full rounded border px-3 py-2 text-base font-mono";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* 1) 单位净重 */}
      <div>
        <input
          className={`${monoInput} border-slate-200`}
          placeholder="单位净重(kg)"
          value={form.weight_kg}
          onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.weight_kg} />
      </div>

      {/* 2) 最小单位（必选） */}
      <div>
        {form.uom_mode === "custom" ? (
          <input
            className={`${commonInput} border-slate-200`}
            placeholder="最小单位（自定义）"
            value={form.uom_custom}
            onChange={(e) => setForm({ ...form, uom_custom: e.target.value })}
            disabled={vm.saving}
          />
        ) : (
          <select
            className={`${commonInput} border-slate-200`}
            value={uomSelectValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__CUSTOM__") {
                setForm({ ...form, uom_mode: "custom", uom_custom: "" });
              } else {
                setForm({ ...form, uom_mode: "preset", uom_preset: v });
              }
            }}
            disabled={vm.saving}
          >
            <option value="">最小单位（必选）</option>
            {UOM_PRESETS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            <option value="__CUSTOM__">自定义</option>
          </select>
        )}
        <FieldError msg={fieldErrors.uom_preset} />
      </div>

      {/* 3) 包装单位（可选，下拉；支持自定义） */}
      <div>
        {packMode === "custom" ? (
          <input
            className={`${commonInput} border-slate-200`}
            placeholder="包装单位（自定义，可选）"
            value={form.case_uom}
            onChange={(e) => setForm({ ...form, case_uom: e.target.value })}
            disabled={vm.saving}
          />
        ) : (
          <select
            className={`${commonInput} border-slate-200`}
            value={caseUomText}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__CUSTOM__") {
                setPackMode("custom");
                // 切到自定义时不写死“箱”，让用户自由输入
                setForm({ ...form, case_uom: "" });
              } else {
                setPackMode("select");
                setForm({ ...form, case_uom: v });
              }
            }}
            disabled={vm.saving}
          >
            <option value="">包装单位（可选，默认：箱）</option>
            {PACK_UOM_PRESETS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
            <option value="__CUSTOM__">自定义</option>
          </select>
        )}
        <FieldError msg={fieldErrors.case_uom} />
      </div>

      {/* 4) 单位换算（整数，可选） */}
      <div>
        <input
          className={[
            monoInput,
            // ✅ 要求：与其他输入一致的“黑边框”风格
            ratioInvalid ? "border-red-300" : "border-slate-900",
          ].join(" ")}
          placeholder="单位换算（整数，可选，如：12）"
          value={form.case_ratio}
          onChange={(e) => {
            // ✅ 关键：永远按字符串态写回，避免任何回弹/不可输入
            setForm({ ...form, case_ratio: e.target.value });
          }}
          disabled={vm.saving}
          inputMode="numeric"
        />
        <FieldError msg={fieldErrors.case_ratio} />
        {!fieldErrors.case_ratio && ratioTouched && ratioInvalid ? (
          <div className="mt-1 text-xs text-red-600">请输入 ≥ 1 的整数</div>
        ) : null}
      </div>
    </div>
  );
};

export default UomAndWeightSection;
