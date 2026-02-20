// src/features/admin/items/editor/sections/ShelfLifeSection.tsx

import React, { useMemo } from "react";
import type { ItemEditorVm } from "../useItemEditor";
import type { ShelfMode } from "../../create/types";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const ShelfLifeSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;
  const shelfEnabled = useMemo(() => form.shelf_mode === "yes", [form.shelf_mode]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <select
          className="rounded border px-3 py-2 w-full"
          value={form.shelf_mode}
          onChange={(e) => {
            const v = e.target.value as ShelfMode;
            if (v === "no") {
              setForm({ ...form, shelf_mode: v, shelf_life_value: "" });
            } else {
              setForm({ ...form, shelf_mode: v });
            }
          }}
          disabled={vm.saving}
        >
          <option value="yes">有效期：有</option>
          <option value="no">有效期：无</option>
        </select>
        <FieldError msg={fieldErrors.shelf_mode} />
      </div>

      <div>
        <input
          className="rounded border px-3 py-2 w-full font-mono"
          placeholder="默认保质期数值"
          value={form.shelf_life_value}
          onChange={(e) => setForm({ ...form, shelf_life_value: e.target.value })}
          disabled={!shelfEnabled || vm.saving}
        />
        <FieldError msg={fieldErrors.shelf_life_value} />
      </div>

      <div>
        <select
          className="rounded border px-3 py-2 w-full"
          value={form.shelf_life_unit}
          onChange={(e) =>
            setForm({ ...form, shelf_life_unit: e.target.value as "MONTH" | "DAY" })
          }
          disabled={!shelfEnabled || vm.saving}
        >
          <option value="MONTH">保质期单位：月</option>
          <option value="DAY">保质期单位：天</option>
        </select>
        <FieldError msg={fieldErrors.shelf_life_unit} />
      </div>
    </div>
  );
};

export default ShelfLifeSection;
