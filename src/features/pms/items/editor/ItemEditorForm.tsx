// src/features/pms/items/editor/ItemEditorForm.tsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { fetchItemListDetail } from "../api/itemListOwnerApi";
import type { ItemListDetail } from "../contracts/itemList";

function parseIdOrNull(v: string): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

type FlowStatusTone = "done" | "pending" | "warning" | "loading" | "error";

type FlowStatus = {
  text: string;
  tone: FlowStatusTone;
};

type FlowStatuses = {
  item: FlowStatus;
  uom: FlowStatus;
  barcode: FlowStatus;
  sku: FlowStatus;
  attributes: FlowStatus;
};

function statusBadgeCls(tone: FlowStatusTone): string {
  if (tone === "done") {
    return "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800";
  }
  if (tone === "warning") {
    return "rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800";
  }
  if (tone === "error") {
    return "rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700";
  }
  if (tone === "loading") {
    return "rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700";
  }
  return "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600";
}

function pendingFlowStatuses(): FlowStatuses {
  const pending: FlowStatus = { text: "保存商品后维护", tone: "pending" };
  return {
    item: { text: "待保存商品本体", tone: "pending" },
    uom: pending,
    barcode: pending,
    sku: pending,
    attributes: pending,
  };
}

function buildFlowStatuses(args: {
  mode: "create" | "edit";
  detail: ItemListDetail | null;
  loading: boolean;
  error: string | null;
}): FlowStatuses {
  if (args.mode === "create") return pendingFlowStatuses();

  if (args.loading) {
    const loading: FlowStatus = { text: "状态加载中", tone: "loading" };
    return {
      item: { text: "已进入编辑流程", tone: "done" },
      uom: loading,
      barcode: loading,
      sku: loading,
      attributes: loading,
    };
  }

  if (args.error) {
    const error: FlowStatus = { text: "状态读取失败", tone: "error" };
    return {
      item: { text: "已进入编辑流程", tone: "done" },
      uom: error,
      barcode: error,
      sku: error,
      attributes: error,
    };
  }

  const detail = args.detail;
  const uoms = detail?.uoms ?? [];
  const barcodes = detail?.barcodes ?? [];
  const skuCodes = detail?.sku_codes ?? [];
  const attributes = detail?.attributes ?? [];

  const hasBaseUom = uoms.some((row) => row.is_base);
  const hasPrimaryBarcode = barcodes.some((row) => row.is_primary && row.active);
  const hasPrimarySku = skuCodes.some((row) => row.is_primary && row.is_active);

  return {
    item: { text: "已创建商品本体", tone: "done" },
    uom: hasBaseUom
      ? { text: "已维护基础包装", tone: "done" }
      : { text: "待完善：先维护基础包装", tone: "warning" },
    barcode: hasPrimaryBarcode
      ? { text: "已绑定主条码", tone: "done" }
      : { text: "待完善：至少绑定一个主条码", tone: "warning" },
    sku: hasPrimarySku
      ? { text: "已维护主 SKU", tone: "done" }
      : { text: "待完善：维护主 SKU", tone: "warning" },
    attributes: attributes.length > 0
      ? { text: `已维护 ${attributes.length} 项`, tone: "done" }
      : { text: "待完善：补充商品属性", tone: "warning" },
  };
}

const FlowStep: React.FC<{
  index: number;
  title: string;
  description: string;
  status: FlowStatus;
  children: React.ReactNode;
}> = ({ index, title, description, status, children }) => (
  <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {index}
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <span className={statusBadgeCls(status.tone)}>{status.text}</span>
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
  const selectedItemId = vm.mode === "edit" && vm.selectedItem ? vm.selectedItem.id : null;
  const [flowDetail, setFlowDetail] = useState<ItemListDetail | null>(null);
  const [flowLoading, setFlowLoading] = useState(false);
  const [flowError, setFlowError] = useState<string | null>(null);

  const reloadFlowDetail = useCallback(async () => {
    if (selectedItemId == null) {
      setFlowDetail(null);
      setFlowError(null);
      setFlowLoading(false);
      return;
    }

    setFlowLoading(true);
    setFlowError(null);
    try {
      setFlowDetail(await fetchItemListDetail(selectedItemId));
    } catch (e) {
      setFlowDetail(null);
      setFlowError(e instanceof Error ? e.message : "流程状态加载失败");
    } finally {
      setFlowLoading(false);
    }
  }, [selectedItemId]);

  useEffect(() => {
    void reloadFlowDetail();
  }, [reloadFlowDetail]);

  const handleGovernanceChanged = useCallback(async () => {
    await vm.refreshAfterExternalChange();
    await reloadFlowDetail();
  }, [reloadFlowDetail, vm]);

  const flowStatuses = useMemo(
    () =>
      buildFlowStatuses({
        mode: vm.mode,
        detail: flowDetail,
        loading: flowLoading,
        error: flowError,
      }),
    [flowDetail, flowError, flowLoading, vm.mode],
  );

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
        status={flowStatuses.item}
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
            status={flowStatuses.uom}
          >
            <ItemUomsGovernanceSection
              itemId={vm.selectedItem.id}
              onChanged={handleGovernanceChanged}
            />
          </FlowStep>

          <FlowStep
            index={3}
            title="条码绑定"
            description="条码绑定到具体包装单位。一个商品可以有多个包装条码，但主条码必须明确。"
            status={flowStatuses.barcode}
          >
            <ItemBarcodesSection
              itemId={vm.selectedItem.id}
              disabled={vm.saving}
              onSaved={handleGovernanceChanged}
            />
          </FlowStep>

          <FlowStep
            index={4}
            title="SKU 编码"
            description="维护当前主 SKU、别名编码和历史编码。商品基础字段中不能直接修改主 SKU。"
            status={flowStatuses.sku}
          >
            <ItemSkuCodesGovernanceSection
              itemId={vm.selectedItem.id}
              currentSku={vm.selectedItem.sku}
              disabled={vm.saving}
              onChanged={handleGovernanceChanged}
            />
          </FlowStep>

          <FlowStep
            index={5}
            title="商品属性"
            description="根据当前商品分类所属商品类型维护属性值；参与 SKU 段的属性应与 SKU 编码治理保持一致。"
            status={flowStatuses.attributes}
          >
            <ItemAttributesSection
              itemId={vm.selectedItem.id}
              categoryId={effectiveCategoryId}
              disabled={vm.saving}
              onSaved={handleGovernanceChanged}
            />
          </FlowStep>
        </>
      ) : (
        <>
          <FlowStep
            index={2}
            title="包装单位"
            description="新建商品保存后再维护包装单位。"
            status={flowStatuses.uom}
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={3}
            title="条码绑定"
            description="新建商品保存并维护包装单位后，再绑定条码。"
            status={flowStatuses.barcode}
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={4}
            title="SKU 编码"
            description="新建商品保存后，再维护别名编码和历史编码。"
            status={flowStatuses.sku}
          >
            <CreateNextStepHint />
          </FlowStep>

          <FlowStep
            index={5}
            title="商品属性"
            description="新建商品保存后，再根据分类维护商品属性。"
            status={flowStatuses.attributes}
          >
            <CreateNextStepHint />
          </FlowStep>
        </>
      )}
    </>
  );
};

export default ItemEditorForm;
