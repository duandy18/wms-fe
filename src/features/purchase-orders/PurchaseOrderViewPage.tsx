// 拆分说明：本文件已从“详情加载 + view/edit 双态 + 保存流程 + 展示区”收薄为装配层；运行状态拆入 detail/model，头部/只读态/编辑态分别拆入 detail/components。路径：src/features/purchase-orders/PurchaseOrderViewPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInboundReceiptFromPurchase } from "../inbound-receipts/api/inboundReceiptsApi";
import { PurchaseOrderLinesTable } from "./PurchaseOrderLinesTable";
import { PurchaseOrderReceiptsPanel } from "./PurchaseOrderReceiptsPanel";
import PurchaseOrderDetailHeader from "./detail/components/PurchaseOrderDetailHeader";
import PurchaseOrderEditPanel from "./detail/components/PurchaseOrderEditPanel";
import PurchaseOrderReadonlyPanel from "./detail/components/PurchaseOrderReadonlyPanel";
import { usePurchaseOrderDetailController } from "./detail/model/usePurchaseOrderDetailController";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

const PurchaseOrderViewPage: React.FC = () => {
  const navigate = useNavigate();
  const c = usePurchaseOrderDetailController();

  const [creatingInbound, setCreatingInbound] = useState(false);
  const [createInboundError, setCreateInboundError] = useState("");

  async function handleCreateInboundReceipt() {
    if (!c.po) return;

    setCreatingInbound(true);
    setCreateInboundError("");

    try {
      const created = await createInboundReceiptFromPurchase({
        source_doc_id: c.po.id,
        warehouse_id: c.po.warehouse_id,
        remark: c.po.remark ?? null,
      });
      navigate(`/inbound-receipts/${created.id}`);
    } catch (err) {
      setCreateInboundError(getErrorMessage(err, "从采购单生成入库单失败"));
    } finally {
      setCreatingInbound(false);
    }
  }

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
          <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  入库单动作
                </div>
                <div className="text-xs text-slate-500">
                  当前按采购单生成独立入库单。若已存在未作废入库单，后端会拒绝重复创建。
                </div>
              </div>

              <button
                type="button"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={creatingInbound || c.po.status !== "CREATED"}
                onClick={() => {
                  if (!window.confirm(`确认基于采购单 ${c.po?.po_no || c.po?.id} 生成入库单？`)) return;
                  void handleCreateInboundReceipt();
                }}
              >
                {creatingInbound ? "生成中…" : "生成入库单"}
              </button>
            </div>

            {createInboundError ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {createInboundError}
              </div>
            ) : null}
          </section>

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
