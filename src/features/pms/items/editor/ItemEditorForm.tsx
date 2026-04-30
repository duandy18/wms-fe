// src/features/pms/items/editor/ItemEditorForm.tsx

import React from "react";
import type { ItemEditorVm } from "./useItemEditor";

import HeaderBar from "./sections/HeaderBar";
import FlashBar from "./sections/FlashBar";
import BasicSection from "./sections/BasicSection";
import ProductAttributesSection from "./sections/ProductAttributesSection";
import StatusSection from "./sections/StatusSection";
import ItemUomsGovernanceSection from "../components/edit/ItemUomsGovernanceSection";
import ItemBarcodesSection from "../components/edit/ItemBarcodesSection";
import ItemSkuCodesGovernanceSection from "../components/edit/ItemSkuCodesGovernanceSection";
import ItemAttributesSection from "../components/edit/ItemAttributesSection";

function parseIdOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

const FlowStep: React.FC<{
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ index, title, description, children }) => (
  <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
        {index}
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
    {children}
  </section>
);

const CreateNextStepHint: React.FC = () => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
    保存商品本体后，会生成商品ID并自动进入编辑流程。包装单位、条码绑定、SKU 编码和商品属性都依赖商品ID。
  </div>
);

const ItemEditorForm: React.FC<{ vm: ItemEditorVm }> = ({ vm }) => {
  const effectiveCategoryId = parseIdOrNull(vm.form.category_id) ?? vm.selectedItem?.category_id ?? null;

  return (
    <>
      <HeaderBar vm={vm} />

      <FlashBar flash={vm.flash} />

      {vm.supError || vm.error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {vm.supError ?? vm.error}
        </div>
      ) : null}

      {!vm.supLoading && vm.suppliers.length === 0 ? (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前没有可用供货商（active=true）。商品可以先不绑定供应商创建，后续再编辑补充。
        </div>
      ) : null}

      <FlowStep
        index={1}
        title="商品本体"
        description="维护 SKU、名称、规格、品牌、分类、供应商、批次策略、有效期策略和启停状态。"
      >
        <form onSubmit={vm.submit} className="space-y-6">
          <BasicSection vm={vm} />

          <ProductAttributesSection vm={vm} />

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
                  ? "保存商品本体"
                  : "保存商品"}
            </button>
          </div>
        </form>
      </FlowStep>

      {vm.mode === "edit" && vm.selectedItem ? (
        <>
          <FlowStep
            index={2}
            title="包装单位"
            description="先维护基础单位、采购默认单位、入库默认单位、出库默认单位和转换系数。条码绑定必须基于包装单位。"
          >
            <ItemUomsGovernanceSection
              itemId={vm.selectedItem.id}
              onChanged={vm.refreshAfterExternalChange}
            />
          </FlowStep>

          <FlowStep
            index={3}
            title="条码绑定"
            description="条码绑定到具体包装单位。一个商品可以有多个包装条码，但主条码必须明确。"
          >
            <ItemBarcodesSection
              itemId={vm.selectedItem.id}
              disabled={vm.saving}
              onSaved={vm.refreshAfterExternalChange}
            />
          </FlowStep>

          <FlowStep
            index={4}
            title="SKU 编码"
            description="维护当前主 SKU、别名编码和历史编码。商品基础字段中不能直接修改主 SKU。"
          >
            <ItemSkuCodesGovernanceSection
              itemId={vm.selectedItem.id}
              currentSku={vm.selectedItem.sku}
              disabled={vm.saving}
              onChanged={vm.refreshAfterExternalChange}
            />
          </FlowStep>

          <FlowStep
            index={5}
            title="商品属性"
            description="根据当前商品分类所属商品类型维护属性值；参与 SKU 段的属性应与 SKU 编码治理保持一致。"
          >
            <ItemAttributesSection
              itemId={vm.selectedItem.id}
              categoryId={effectiveCategoryId}
              disabled={vm.saving}
            />
          </FlowStep>
        </>
      ) : (
        <>
          <FlowStep
            index={2}
            title="包装单位"
            description="新建商品保存后再维护包装单位。"
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={3}
            title="条码绑定"
            description="新建商品保存并维护包装单位后，再绑定条码。"
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={4}
            title="SKU 编码"
            description="新建商品保存后，再维护别名编码和历史编码。"
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={5}
            title="商品属性"
            description="新建商品保存后，再根据分类维护商品属性。"
          >
            <CreateNextStepHint />
          </FlowStep>
        </>
      )}
    </>
  );
};

export default ItemEditorForm;
