// src/features/pms/items/editor/sections/BasicSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <div className="mt-1 text-xs text-red-600">{msg}</div> : null;

const BasicSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm, fieldErrors } = vm;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <input
          className="rounded border px-3 py-2 w-full bg-white"
          placeholder="商品名称"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.name} />
      </div>

      <div>
        <input
          className="rounded border px-3 py-2 w-full bg-white"
          placeholder="规格（可选，如：85g*12袋）"
          value={form.spec}
          onChange={(e) => setForm({ ...form, spec: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.spec} />
      </div>

      <div>
        <input
          className="rounded border px-3 py-2 w-full bg-white"
          placeholder="品牌（可选）"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.brand} />
      </div>

      <div>
        <input
          className="rounded border px-3 py-2 w-full bg-white"
          placeholder="品类（可选）"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          disabled={vm.saving}
        />
        <FieldError msg={fieldErrors.category} />
      </div>
    </div>
  );
};

export default BasicSection;
