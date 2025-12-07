// src/features/purchase-orders/PurchaseOrderCreateV2Page.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { usePurchaseOrderCreatePresenter } from "./usePurchaseOrderCreatePresenter";
import { PurchaseOrderCreateHeaderForm } from "./PurchaseOrderCreateHeaderForm";
import { PurchaseOrderCreateLinesEditor } from "./PurchaseOrderCreateLinesEditor";
import { PurchaseOrderCurrentReport } from "./PurchaseOrderCurrentReport";

const PurchaseOrderCreateV2Page: React.FC = () => {
  const navigate = useNavigate();
  const [state, actions] = usePurchaseOrderCreatePresenter();

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    await actions.submit(); // 成功后不跳转，直接在本页显示报告
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部标题 + 返回按钮 */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <PageTitle
          title="新建多行采购单（Cockpit）"
          description="按 Excel 风格录入多 SKU 采购单。创建成功后，本页下方会显示本次采购报告，并可导出 CSV。"
        />

        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          ← 返回采购单列表
        </button>
      </div>

      {/* 表单区域 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 头部信息：供应商 / 仓库 / 备注 */}
        <PurchaseOrderCreateHeaderForm
          supplierId={state.supplierId}
          supplierName={state.supplierName}
          supplierOptions={state.supplierOptions}
          suppliersLoading={state.suppliersLoading}
          suppliersError={state.suppliersError}
          warehouseId={state.warehouseId}
          remark={state.remark}
          error={state.error}
          onSelectSupplier={actions.selectSupplier}
          onChangeWarehouseId={actions.setWarehouseId}
          onChangeRemark={actions.setRemark}
        />

        {/* 行明细编辑 */}
        <PurchaseOrderCreateLinesEditor
          lines={state.lines}
          items={state.itemOptions}
          itemsLoading={state.itemsLoading}
          onSelectItem={actions.selectItemForLine}
          onChangeLineField={actions.changeLineField}
          onAddLine={actions.addLine}
          onRemoveLine={actions.removeLine}
        />

        {/* 创建按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={state.submitting}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-60"
          >
            {state.submitting ? "创建中…" : "创建多行采购单"}
          </button>
        </div>
      </form>

      {/* 本次采购报告：放在按钮下面 */}
      <div className="mt-8">
        <PurchaseOrderCurrentReport po={state.lastCreatedPo} />
      </div>
    </div>
  );
};

export default PurchaseOrderCreateV2Page;
