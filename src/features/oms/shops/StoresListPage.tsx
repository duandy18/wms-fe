// src/features/admin/stores/StoresListPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useStoresListPresenter } from "./useStoresListPresenter";
import { StoreCreateForm } from "./StoreCreateForm";
import { StoresTable } from "./StoresTable";

export default function StoresListPage() {
  const navigate = useNavigate();
  const p = useStoresListPresenter();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">店铺管理</h1>
          <p className="text-sm text-slate-600 mt-1">
            管理平台店铺档案。店铺详情页以「SKU → 履约仓（唯一）」为主线配置入口。
          </p>
        </div>
      </header>

      {p.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {p.error}
        </div>
      )}

      <StoreCreateForm
        plat={p.plat}
        shopId={p.shopId}
        name={p.name}
        shopType={p.shopType}
        onShopTypeChange={p.setShopType}
        saving={p.saving}
        canWrite={p.canWrite}
        onPlatChange={p.setPlat}
        onShopIdChange={p.setShopId}
        onNameChange={p.setName}
        onSubmit={p.handleCreate}
      />

      <StoresTable
        canRead={p.canRead}
        canWrite={p.canWrite}
        loading={p.loading}
        saving={p.saving}
        error={p.error}
        visibleStores={p.visibleStores}
        showInactive={p.showInactive}
        onToggleShowInactive={p.setShowInactive}
        sortKey={p.sortKey}
        sortAsc={p.sortAsc}
        onSort={p.handleSort}
        onToggleActive={p.handleToggleActive}
        onOpenDetail={(id) => navigate(`/stores/${id}`)}
      />
    </div>
  );
}
