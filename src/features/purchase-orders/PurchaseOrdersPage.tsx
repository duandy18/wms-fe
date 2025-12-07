// src/features/purchase-orders/PurchaseOrdersPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { PurchaseOrdersTable } from "./PurchaseOrdersTable";
import {
  usePurchaseOrdersListPresenter,
  type StatusFilter,
} from "./usePurchaseOrdersListPresenter";
import { apiGet } from "../../lib/api";

type SupplierOption = {
  id: number;
  name: string;
};

type SuppliersApiResponse = {
  ok: boolean;
  data: {
    id: number;
    name: string;
    active: boolean;
  }[];
};

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  // 列表 Presenter：统一管理 orders / loading / error / filter
  const [
    { orders, loadingList, listError, supplierFilter, statusFilter },
    { setSupplierFilter, setStatusFilter, reload },
  ] = usePurchaseOrdersListPresenter();

  // 当前行选中状态（用于高亮）
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  // 供应商下拉选项
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await apiGet<SuppliersApiResponse>(
          "/suppliers?active=true",
        );
        const list = (res as any)?.data ?? res;
        const options: SupplierOption[] = (list || []).map((s: any) => ({
          id: s.id,
          name: s.name,
        }));
        setSupplierOptions(options);
      } catch (err) {
        console.error("loadSuppliers failed", err);
        // 下拉加载失败不阻断页面逻辑
      }
    }

    void loadSuppliers();
  }, []);

  function handleRowClick(id: number) {
    setSelectedPoId(id);
    navigate(`/purchase-orders/${id}`);
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="采购单列表"
        description="查看历史采购单，点击记录进入详情页查看采购报告（供应商视图）与行级收货。"
      />

      {/* 列表区（过滤 + 表格） */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        {/* 过滤工具条 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">
            采购单列表
          </h2>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* 供应商下拉 */}
            <select
              className="w-40 rounded-md border border-slate-300 px-2 py-1"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">全部供应商</option>
              {supplierOptions.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* 状态筛选 */}
            <select
              className="w-32 rounded-md border border-slate-300 px-2 py-1"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
            >
              <option value="ALL">全部状态</option>
              <option value="CREATED">新建</option>
              <option value="PARTIAL">部分收货</option>
              <option value="RECEIVED">已收货</option>
              <option value="CLOSED">已关闭</option>
            </select>

            {/* 刷新按钮 */}
            <button
              type="button"
              onClick={reload}
              disabled={loadingList}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
            >
              {loadingList ? "查询中…" : "刷新"}
            </button>
          </div>
        </div>

        {/* 表格区（统一用 PurchaseOrdersTable + StandardTable） */}
        <PurchaseOrdersTable
          orders={orders}
          loading={loadingList}
          error={listError}
          onRowClick={handleRowClick}
          selectedPoId={selectedPoId}
        />
      </section>
    </div>
  );
};

export default PurchaseOrdersPage;
