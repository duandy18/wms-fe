// src/features/admin/items/editor/sections/SupplierSection.tsx

import React from "react";
import type { Supplier } from "../../../suppliers/api";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const SupplierSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3">
        <select
          className="rounded border px-3 py-2 w-full"
          value={form.supplier_id}
          onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
          disabled={vm.supLoading || vm.saving}
        >
          <option value="">
            {vm.supLoading ? "供货商加载中…" : "请选择供货商（必选）"}
          </option>
          {vm.suppliers.map((s: Supplier) => (
            <option key={s.id} value={String(s.id)}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError msg={fieldErrors.supplier_id} />
      </div>
    </div>
  );
};

export default SupplierSection;
