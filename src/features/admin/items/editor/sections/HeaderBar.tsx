// src/features/admin/items/editor/sections/HeaderBar.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const HeaderBar: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{vm.editorTitle}</h2>

        {vm.mode === "create" ? (
          <div className="mt-1 text-[11px] text-slate-500">
            SKU：保存后自动生成（<span className="font-mono">AKT-000001...</span>）
          </div>
        ) : (
          <div className="mt-1 text-[11px] text-slate-500">
            当前编辑：SKU <span className="font-mono">{vm.selectedItem?.sku ?? "-"}</span> ，商品ID{" "}
            <span className="font-mono">{vm.selectedItem?.id ?? "-"}</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        {vm.mode === "edit" ? (
          <button
            type="button"
            className="rounded border px-3 py-2 text-[11px] text-slate-700 disabled:opacity-60"
            onClick={vm.resetToCreate}
            disabled={vm.saving}
          >
            返回新建
          </button>
        ) : null}

        {vm.mode === "create" && vm.created ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
            <div className="font-semibold">创建成功</div>
            <div>
              SKU：<span className="font-mono">{vm.created.sku}</span>
            </div>
            <div>
              商品ID：<span className="font-mono">{vm.created.id}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HeaderBar;
