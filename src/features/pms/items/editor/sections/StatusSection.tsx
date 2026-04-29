// src/features/pms/items/editor/sections/StatusSection.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";
import type { StatusMode } from "../../create/types";

const StatusSection: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const { form, setForm } = vm;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        className="rounded border px-3 py-2"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value as StatusMode })}
        disabled={vm.saving}
      >
        <option value="enabled">状态：有效</option>
        <option value="disabled">状态：无效</option>
      </select>

      <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-center">
        {vm.mode === "edit" ? (
          <>
            <span className="text-slate-500">SKU：</span>
            <span className="ml-2 font-mono text-slate-900">{vm.selectedItem?.sku ?? "-"}</span>
          </>
        ) : (
          <span className="text-slate-600">创建商品时必须填写 SKU，可从「SKU编码」页面生成后复制。</span>
        )}
      </div>
    </div>
  );
};

export default StatusSection;
