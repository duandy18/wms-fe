// src/features/admin/warehouses/WarehousesListPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useWarehousesListPresenter } from "./useWarehousesListPresenter";
import { WarehousesTable } from "./WarehousesTable";

const WarehousesListPage: React.FC = () => {
  const navigate = useNavigate();
  const p = useWarehousesListPresenter();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">仓库管理</h1>
          <p className="text-sm text-slate-600 mt-1">
            管理仓库主数据（名称/编码/地址/联系人/电话/面积/启用状态），为店铺绑定、出库路由、库存视图提供基础信息。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!p.canWrite}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            onClick={() => navigate("/warehouses/new")}
          >
            创建仓库
          </button>
        </div>
      </header>

      {p.fulfillmentWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-semibold">履约覆盖提示</div>
          <div className="mt-1">{p.fulfillmentWarning}</div>
        </div>
      )}

      {p.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {p.error}
        </div>
      )}

      <WarehousesTable
        canRead={p.canRead}
        canWrite={p.canWrite}
        loading={p.loading}
        saving={p.saving}
        visibleWarehouses={p.visibleWarehouses}
        showInactive={p.showInactive}
        onToggleShowInactive={p.setShowInactive}
        sortKey={p.sortKey}
        sortAsc={p.sortAsc}
        onSort={p.handleSort}
        onToggleActive={p.handleToggleActive}
        onOpenDetail={(id) => navigate(`/warehouses/${id}`)}
        coverageById={p.coverageById}
        activeCarriersByWarehouseId={p.activeCarriersByWarehouseId}
      />
    </div>
  );
};

export default WarehousesListPage;
