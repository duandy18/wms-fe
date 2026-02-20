// src/features/admin/items/editor/sections/UomAndWeightSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const UomAndWeightSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <input
          className="rounded border px-3 py-2 w-full font-mono"
          placeholder="单位净重(kg)"
          value={form.weight_kg}
          onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.weight_kg} />
      </div>

      <div className="space-y-2 md:col-span-2">
        <select
          className="w-full rounded border px-3 py-2"
          value={form.uom_mode === "preset" ? form.uom_preset : "__CUSTOM__"}
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
          <option value="">最小包装单位（必选）</option>
          {["PCS", "袋", "包", "罐", "瓶", "箱", "件"].map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
          <option value="__CUSTOM__">自定义</option>
        </select>
        <FieldError msg={fieldErrors.uom_preset} />

        {form.uom_mode === "custom" ? (
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="最小包装单位"
            value={form.uom_custom}
            onChange={(e) => setForm({ ...form, uom_custom: e.target.value })}
            disabled={vm.saving}
          />
        ) : null}
      </div>
    </div>
  );
};

export default UomAndWeightSection;
