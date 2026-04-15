// src/features/purchase-orders/PurchaseOrderCreatePage.tsx
// 新建采购单页
// - 上半区：头部输入 + 行明细输入
// - 创建成功后直接跳转到采购单详情页

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { PurchaseOrderCreateHeaderForm } from "./PurchaseOrderCreateHeaderForm";
import { PurchaseOrderCreateLinesEditor } from "./PurchaseOrderCreateLinesEditor";
import { nowIsoMinuteForDatetimeLocal } from "./create/utils";
import { useSubmitPurchaseOrder } from "./create/presenter/useSubmitPurchaseOrder";
import { usePurchaseOrderFormShell } from "./form/usePurchaseOrderFormShell";

const PurchaseOrderCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [formState, formActions] = usePurchaseOrderFormShell({
    getFreshPurchaseTime: nowIsoMinuteForDatetimeLocal,
  });

  const submitModel = useSubmitPurchaseOrder({
    supplierId: formState.supplierId,
    supplierName: formState.supplierName,
    warehouseId: formState.warehouseId,
    purchaser: formState.purchaser,
    purchaseTime: formState.purchaseTime,
    remark: formState.remark,
    lines: formState.lines,
    onAfterSuccessReset: formActions.resetAfterCreateSuccess,
  });

  const handleSelectSupplier = (id: number | null) => {
    formActions.selectSupplier(id);

    if (id == null) {
      submitModel.setError(null);
      return;
    }

    submitModel.setError("已切换供应商：已清空行明细，请重新选择该供应商提供的商品。");
  };

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    await submitModel.submit((poId) => navigate(`/purchase-orders/${poId}`));
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <PageTitle
            title="新建采购单"
            description="独立新建页：录入采购计划并创建采购单。创建成功后直接进入采购单详情页，不再在本页停留查看回显。"
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
          supplierId={formState.supplierId}
          supplierName={formState.supplierName}
          supplierOptions={formState.supplierOptions}
          suppliersLoading={formState.suppliersLoading}
          suppliersError={formState.suppliersError}
          warehouseId={formState.warehouseId}
          purchaser={formState.purchaser}
          purchaseTime={formState.purchaseTime}
          remark={formState.remark}
          error={submitModel.error}
          onSelectSupplier={handleSelectSupplier}
          onChangeWarehouseId={formActions.setWarehouseId}
          onChangePurchaser={formActions.setPurchaser}
          onChangePurchaseTime={formActions.setPurchaseTime}
          onChangeRemark={formActions.setRemark}
        />

        <PurchaseOrderCreateLinesEditor
          lines={formState.lines}
          items={formState.itemOptions}
          itemsLoading={formState.itemsLoading}
          onSelectItem={formActions.selectItemForLine}
          onChangeLineField={formActions.changeLineField}
          onAddLine={formActions.addLine}
          onRemoveLine={formActions.removeLine}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitModel.submitting}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {submitModel.submitting ? "创建中…" : "创建采购单"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseOrderCreatePage;
