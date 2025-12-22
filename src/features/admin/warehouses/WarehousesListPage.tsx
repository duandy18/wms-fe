// src/features/admin/warehouses/WarehousesListPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useWarehousesListPresenter } from "./useWarehousesListPresenter";
import { WarehouseCreateForm } from "./WarehouseCreateForm";
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
      </header>

      {p.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {p.error}
        </div>
      )}

      <WarehouseCreateForm
        canWrite={p.canWrite}
        saving={p.saving}
        name={p.name}
        code={p.code}
        active={p.active}
        address={p.address}
        contactName={p.contactName}
        contactPhone={p.contactPhone}
        areaSqm={p.areaSqm}
        onNameChange={p.setName}
        onCodeChange={p.setCode}
        onActiveChange={p.setActive}
        onAddressChange={p.setAddress}
        onContactNameChange={p.setContactName}
        onContactPhoneChange={p.setContactPhone}
        onAreaSqmChange={p.setAreaSqm}
        onSubmit={p.handleCreate}
      />

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
      />
    </div>
  );
};

export default WarehousesListPage;
