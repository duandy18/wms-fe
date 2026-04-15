import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "../../components/ui/PageTitle";
import { PurchaseOrdersTable } from "./PurchaseOrdersTable";
import {
  usePurchaseOrdersListPresenter,
  type StatusFilter,
  type PurchaseOrderCompletionListItem,
} from "./usePurchaseOrdersListPresenter";
import {
  fetchSuppliersBasic,
  type SupplierBasic,
} from "../../domains/pms/public";

type SupplierOption = SupplierBasic;

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();

  const [
    { rows, loadingList, listError, supplierFilter, statusFilter, searchText },
    { setSupplierFilter, setStatusFilter, setSearchText, reload },
  ] = usePurchaseOrdersListPresenter();

  const [selectedPoLineId, setSelectedPoLineId] = useState<number | null>(null);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);

  useEffect(() => {
    let alive = true;

    async function loadSuppliers() {
      try {
        const list = await fetchSuppliersBasic({ active: true });
        if (!alive) return;
        setSupplierOptions(list);
      } catch (err) {
        console.error("loadSuppliers failed", err);
        if (!alive) return;
        setSupplierOptions([]);
      }
    }

    void loadSuppliers();

    return () => {
      alive = false;
    };
  }, []);

  function handleEditRow(row: PurchaseOrderCompletionListItem) {
    setSelectedPoLineId(row.po_line_id);
  }

  return (
    <div className="p-6 space-y-6">
      <PageTitle
        title="采购列表"
        description="按采购单行查看计划、已收、剩余与最近收货时间。列表页负责搜索筛选与浏览，新建采购单请进入独立新建页。"
      />

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-800">采购计划完成情况</h2>
            <p className="text-xs text-slate-500">
              一行对应一条采购单行，显示计划、已收、剩余与最近收货时间。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate("/purchase-orders/new")}
              className="rounded-md bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-500"
            >
              新建采购单
            </button>

            <input
              type="text"
              className="w-48 rounded-md border border-slate-300 px-2 py-1"
              placeholder="搜索采购单号 / 供应商 / 商品 / SKU"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              className="w-40 rounded-md border border-slate-300 px-2 py-1"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">全部供应商</option>
              {supplierOptions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="w-32 rounded-md border border-slate-300 px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">全部状态</option>
              <option value="NOT_RECEIVED">未收</option>
              <option value="PARTIAL">部分完成</option>
              <option value="RECEIVED">已完成</option>
            </select>

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

        <PurchaseOrdersTable
          rows={rows}
          loading={loadingList}
          error={listError}
          onEditRow={handleEditRow}
          selectedPoLineId={selectedPoLineId}
        />
      </section>
    </div>
  );
};

export default PurchaseOrdersPage;
