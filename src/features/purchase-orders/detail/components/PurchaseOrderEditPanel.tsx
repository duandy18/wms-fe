// src/features/purchase-orders/detail/components/PurchaseOrderEditPanel.tsx
// 拆分说明：从 PurchaseOrderViewPage.tsx 抽出详情页编辑态表单区；页面层只保留模式切换与装配。

import React from "react";
import { PurchaseOrderCreateHeaderForm } from "../../PurchaseOrderCreateHeaderForm";
import { PurchaseOrderCreateLinesEditor } from "../../PurchaseOrderCreateLinesEditor";
import type {
  PurchaseOrderFormShellActions,
  PurchaseOrderFormShellState,
} from "../../form/usePurchaseOrderFormShell";

interface PurchaseOrderEditPanelProps {
  formState: PurchaseOrderFormShellState;
  formActions: PurchaseOrderFormShellActions;
  formError: string | null;
  saving: boolean;
  onSelectSupplier: (id: number | null) => void;
  onCancel: () => void;
  onSubmit: React.FormEventHandler;
}

const PurchaseOrderEditPanel: React.FC<PurchaseOrderEditPanelProps> = ({
  formState,
  formActions,
  formError,
  saving,
  onSelectSupplier,
  onCancel,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        编辑保存会以后端准入规则为准：若该采购单已有 DRAFT 收货单，或已发生正式采购入库事实，将返回冲突并拒绝保存。
      </div>

      {formState.itemsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          商品加载失败：{formState.itemsError}
        </div>
      ) : null}

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
        error={formError}
        onSelectSupplier={onSelectSupplier}
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

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "保存中…" : "保存采购单"}
        </button>
      </div>
    </form>
  );
};

export default PurchaseOrderEditPanel;
