// src/features/pms/items/editor/sections/HeaderBar.tsx

import React from "react";
import type { ItemEditorVm } from "../useItemEditor";

const HeaderBar: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold">{vm.editorTitle}</h2>

        {vm.mode === "create" ? (
          <div className="mt-1 text-xs text-slate-500">
            先创建商品本体。保存成功后会自动进入编辑流程，再继续维护包装单位、条码绑定、SKU 编码和商品属性。
          </div>
        ) : (
          <div className="mt-1 space-y-1 text-xs text-slate-500">
            <div>
              当前编辑：主 SKU <span className="font-mono text-slate-900">{vm.selectedItem?.sku ?? "-"}</span>
              <span className="mx-2 text-slate-300">|</span>
              商品ID <span className="font-mono text-slate-900">{vm.selectedItem?.id ?? "-"}</span>
            </div>
            <div>
              推荐流程：商品本体 → 包装单位 → 条码绑定 → SKU 编码 → 商品属性。
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        {vm.mode === "edit" ? (
          <button
            type="button"
            className="rounded border px-3 py-2 text-xs text-slate-700 disabled:opacity-60"
            onClick={vm.resetToCreate}
            disabled={vm.saving}
          >
            返回新建
          </button>
        ) : null}

        {vm.created ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            <div className="font-semibold">刚创建商品</div>
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
