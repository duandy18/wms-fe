// src/features/purchase-orders/detail/components/PurchaseOrderDetailHeader.tsx
// 拆分说明：从 PurchaseOrderViewPage.tsx 抽出详情页头部区；页面层只负责装配与路由跳转。

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import type { PurchaseOrderDetail } from "../../api";
import type { PageMode } from "../utils";

interface PurchaseOrderDetailHeaderProps {
  mode: PageMode;
  po: PurchaseOrderDetail | null;
  canEdit: boolean;
  onBack: () => void;
  onStartEdit: () => void;
}

const PurchaseOrderDetailHeader: React.FC<PurchaseOrderDetailHeaderProps> = ({
  mode,
  po,
  canEdit,
  onBack,
  onStartEdit,
}) => {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <PageTitle
          title={mode === "edit" ? "编辑采购单" : "查看采购单"}
          description={
            mode === "edit"
              ? "在详情页内直接编辑采购计划。保存时以后端准入规则为准：存在 DRAFT 收货单或正式采购入库事实时将禁止修改。"
              : "采购列表页只负责搜索与完成情况浏览；进入本页后查看采购计划头表、行明细与正式收货事实。"
          }
        />
        {po ? (
          <p className="mt-2 text-sm text-slate-600">
            当前采购单：
            <span className="font-mono">
              {po.po_no || `PO-${po.id}`}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          返回采购列表
        </button>

        {mode === "view" && canEdit ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-500"
          >
            编辑采购单
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default PurchaseOrderDetailHeader;
