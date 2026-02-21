// src/features/admin/items/editor/ItemEditorForm.tsx

import React from "react";
import type { ItemEditorVm } from "./useItemEditor";
import HeaderBar from "./sections/HeaderBar";
import FlashBar from "./sections/FlashBar";
import BasicSection from "./sections/BasicSection";
import SupplierSection from "./sections/SupplierSection";
import UomAndWeightSection from "./sections/UomAndWeightSection";
import ShelfLifeSection from "./sections/ShelfLifeSection";
import StatusSection from "./sections/StatusSection";

const ItemEditorForm: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
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

      <form onSubmit={vm.submit} className="space-y-4">
        <BasicSection vm={vm} />
        <SupplierSection vm={vm} />
        <UomAndWeightSection vm={vm} />
        <ShelfLifeSection vm={vm} />
        <StatusSection vm={vm} />

        <button
          type="submit"
          disabled={!vm.canSubmit}
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {vm.saving ? "保存中…" : vm.mode === "edit" ? "保存修改" : "保存商品"}
        </button>
      </form>
    </>
  );
};

export default ItemEditorForm;
