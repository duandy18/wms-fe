// src/features/purchase-orders/PurchaseOrderCreateV2Page.tsx
// 新建多行采购单（Cockpit，大字号版）
// - 头部：供应商 / 仓库 / 采购人 / 采购时间（必填）
// - 行明细：多 SKU 录入
// - 提交后在本页下方展示本次采购报告（不跳转）

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
    <div className="p-8 space-y-8">
      {/* 顶部标题 + 返回按钮 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle
            title="新建多行采购单（Cockpit）"
            description="按 Excel 风格录入多 SKU 采购单，支持下方生成本次采购汇总报告，并可导出 CSV。"
          />
          <p className="mt-2 text-lg text-slate-600">
            这是“采购作业驾驶舱”：字体更大、行距更宽，适合在仓库或办公室大屏幕上直接操作。
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/purchase-orders")}
          className="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          ← 返回采购单列表
        </button>
      </div>

      {/* 表单区域 */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 头部信息：供应商 / 仓库 / 采购人 / 采购时间 */}
        <PurchaseOrderCreateHeaderForm
          supplierId={state.supplierId}
          supplierName={state.supplierName}
          supplierOptions={state.supplierOptions}
          suppliersLoading={state.suppliersLoading}
          suppliersError={state.suppliersError}
          warehouseId={state.warehouseId}
          purchaser={state.purchaser}
          purchaseTime={state.purchaseTime}
          error={state.error}
          onSelectSupplier={actions.selectSupplier}
          onChangeWarehouseId={actions.setWarehouseId}
          onChangePurchaser={actions.setPurchaser}
          onChangePurchaseTime={actions.setPurchaseTime}
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
            className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {state.submitting ? "创建中…" : "创建多行采购单"}
          </button>
        </div>
      </form>

      {/* 本次采购报告：放在按钮下面 */}
      <div className="mt-10">
        <PurchaseOrderCurrentReport po={state.lastCreatedPo} />
      </div>
    </div>
  );
};

export default PurchaseOrderCreateV2Page;
