// src/features/pms/items/editor/ItemEditorForm.tsx

import React from "react";
import type { ItemEditorVm } from "./useItemEditor";

import HeaderBar from "./sections/HeaderBar";
import FlashBar from "./sections/FlashBar";
import BasicSection from "./sections/BasicSection";
import ProductAttributesSection from "./sections/ProductAttributesSection";
import StatusSection from "./sections/StatusSection";
import ItemSkuCodesGovernanceSection from "../components/edit/ItemSkuCodesGovernanceSection";
import ItemAttributesSection from "../components/edit/ItemAttributesSection";

function parseIdOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

const ItemEditorForm: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const effectiveCategoryId = parseIdOrNull(vm.form.category_id) ?? vm.selectedItem?.category_id ?? null;

  return (
    <>
      <HeaderBar vm={vm} />

      <FlashBar flash={vm.flash} />

      {(vm.supError || vm.error) ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {vm.supError ?? vm.error}
        </div>
      ) : null}

      {!vm.supLoading && vm.suppliers.length === 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前没有可用供货商（active=true）。请先到「系统管理 → 供应商主数据」新建并启用供应商。
        </div>
      ) : null}

      <form onSubmit={vm.submit} className="space-y-6">
        {/* 商品本体基础字段 */}
        <BasicSection vm={vm} />

        {vm.mode === "edit" && vm.selectedItem ? (
          <ItemSkuCodesGovernanceSection
            itemId={vm.selectedItem.id}
            currentSku={vm.selectedItem.sku}
            disabled={vm.saving}
            onChanged={vm.refreshAfterExternalChange}
          />
        ) : null}

        {vm.mode === "edit" && vm.selectedItem ? (
          <ItemAttributesSection
            itemId={vm.selectedItem.id}
            categoryId={effectiveCategoryId}
            disabled={vm.saving}
          />
        ) : null}

        {/* 供应商 / 批次策略 / 有效期策略 */}
        <ProductAttributesSection vm={vm} />

        {/* 状态 */}
        <StatusSection vm={vm} />

        <div className="flex items-center gap-3 pt-2">
          {vm.mode === "edit" ? (
            <button
              type="button"
              onClick={vm.resetToEditOriginal}
              disabled={vm.saving}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              title="放弃本次编辑的所有修改，恢复到进入编辑时的状态"
            >
              放弃修改
            </button>
          ) : null}

          <button
            type="submit"
            disabled={!vm.canSubmit}
            className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {vm.saving
              ? "保存中…"
              : vm.mode === "edit"
                ? "保存修改"
                : "保存商品"}
          </button>
        </div>
      </form>
    </>
  );
};

export default ItemEditorForm;
