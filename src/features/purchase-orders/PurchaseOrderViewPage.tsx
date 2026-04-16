// 拆分说明：本文件已从“详情加载 + view/edit 双态 + 保存流程 + 展示区”收薄为装配层；运行状态拆入 detail/model，头部/只读态/编辑态分别拆入 detail/components。路径：src/features/purchase-orders/PurchaseOrderViewPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";
import { PurchaseOrderReceiptsPanel } from "./PurchaseOrderReceiptsPanel";
import PurchaseOrderDetailHeader from "./detail/components/PurchaseOrderDetailHeader";
import PurchaseOrderEditPanel from "./detail/components/PurchaseOrderEditPanel";
import PurchaseOrderReadonlyPanel from "./detail/components/PurchaseOrderReadonlyPanel";
import { usePurchaseOrderDetailController } from "./detail/model/usePurchaseOrderDetailController";

const PurchaseOrderViewPage: React.FC = () => {
  const navigate = useNavigate();
  const c = usePurchaseOrderDetailController();

  return (
    <div className="p-8 space-y-6">
      <PurchaseOrderDetailHeader
        mode={c.mode}
        po={c.po}
        canEdit={c.canEdit}
        onBack={() => navigate("/purchase-orders")}
        onStartEdit={c.startEdit}
      />

      {c.loading ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          加载中…
        </section>
      ) : null}

      {!c.loading && c.error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          加载失败：{c.error}
        </section>
      ) : null}

      {!c.loading && !c.error && c.po && c.mode === "view" ? (
        <>
          <PurchaseOrderReadonlyPanel po={c.po} canEdit={c.canEdit} />

          <PurchaseOrderLinesTable
            po={c.po}
            selectedLineId={c.selectedLineId}
            onSelectLine={c.setSelectedLineId}
          />

          <PurchaseOrderReceiptsPanel poId={c.po.id} />
        </>
      ) : null}

      {!c.loading && !c.error && c.po && c.mode === "edit" ? (
        <PurchaseOrderEditPanel
          formState={c.formState}
          formActions={c.formActions}
          formError={c.formError}
          saving={c.saving}
          onSelectSupplier={c.selectSupplier}
          onCancel={c.cancelEdit}
          onSubmit={c.saveEdit}
        />
      ) : null}
    </div>
  );
};

export default PurchaseOrderViewPage;
