// src/features/purchase-orders/PurchaseOrderCreatePage.tsx
// 新建采购单页
// - 上半区：头部输入 + 行明细输入
// - 下半区：本次创建后的只读回显报告

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { usePurchaseOrderCreatePresenter } from "./usePurchaseOrderCreatePresenter";
import { PurchaseOrderCreateHeaderForm } from "./PurchaseOrderCreateHeaderForm";
import { PurchaseOrderCreateLinesEditor } from "./PurchaseOrderCreateLinesEditor";
import { PurchaseOrderCurrentReport } from "./PurchaseOrderCurrentReport";

const PurchaseOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [state, actions] = usePurchaseOrderCreatePresenter();

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    await actions.submit();
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <PageTitle
            title="新建采购单"
            description="独立新建页：上半区录入采购计划，下半区只展示本次创建成功的采购单回显报告。页面不承载全量采购列表。"
          />
          <p className="mt-2 text-base text-slate-600">
            供应商与商品来自 PMS 真相源；数量、单位与商业字段在此录入，BASE 数量由后端按倍率推导。
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          返回采购列表
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <PurchaseOrderCreateHeaderForm
          supplierId={state.supplierId}
          supplierName={state.supplierName}
          supplierOptions={state.supplierOptions}
          suppliersLoading={state.suppliersLoading}
          suppliersError={state.suppliersError}
          warehouseId={state.warehouseId}
          purchaser={state.purchaser}
          purchaseTime={state.purchaseTime}
          remark={state.remark}
          error={state.error}
          onSelectSupplier={actions.selectSupplier}
          onChangeWarehouseId={actions.setWarehouseId}
          onChangePurchaser={actions.setPurchaser}
          onChangePurchaseTime={actions.setPurchaseTime}
          onChangeRemark={actions.setRemark}
        />

        <PurchaseOrderCreateLinesEditor
          lines={state.lines}
          items={state.itemOptions}
          itemsLoading={state.itemsLoading}
          onSelectItem={actions.selectItemForLine}
          onChangeLineField={actions.changeLineField}
          onAddLine={actions.addLine}
          onRemoveLine={actions.removeLine}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={state.submitting}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {state.submitting ? "创建中…" : "创建采购单"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <PurchaseOrderCurrentReport po={state.lastCreatedPo} />
      </div>
    </div>
  );
};

export default PurchaseOrderCreatePage;
