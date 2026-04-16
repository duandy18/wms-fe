// 拆分说明：本文件已从“页面 + 供应商加载 + 列表筛选接线”收薄为装配层；运行状态拆入 list/model，工具条拆入 list/components。路径：src/features/purchase-orders/PurchaseOrdersPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { PurchaseOrdersTable } from "./PurchaseOrdersTable";
import type { PurchaseOrderCompletionListItem } from "./api";
import PurchaseOrdersToolbar from "./list/components/PurchaseOrdersToolbar";
import { usePurchaseOrdersPageController } from "./list/model/usePurchaseOrdersPageController";

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const c = usePurchaseOrdersPageController();

  function handleOpenDetail(row: PurchaseOrderCompletionListItem) {
    navigate(`/purchase-orders/${row.po_id}`);
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="采购列表"
        description="按采购单行查看计划、已收、剩余与最近收货时间。列表页负责搜索筛选与浏览，新建采购单请进入独立新建页。"
      />

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <PurchaseOrdersToolbar
          searchText={c.searchText}
          supplierFilter={c.supplierFilter}
          statusFilter={c.statusFilter}
          supplierOptions={c.supplierOptions}
          suppliersLoading={c.suppliersLoading}
          suppliersError={c.suppliersError}
          loading={c.loadingList}
          onChangeSearchText={c.setSearchText}
          onChangeSupplierFilter={c.setSupplierFilter}
          onChangeStatusFilter={c.setStatusFilter}
          onRefresh={c.reload}
          onOpenCreate={() => navigate("/purchase-orders/new")}
        />

        <PurchaseOrdersTable
          rows={c.rows}
          loading={c.loadingList}
          error={c.listError}
          onEditRow={handleOpenDetail}
          selectedPoLineId={null}
        />
      </section>
    </div>
  );
};

export default PurchaseOrdersPage;
