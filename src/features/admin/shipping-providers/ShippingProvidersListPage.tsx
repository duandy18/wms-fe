// src/features/admin/shipping-providers/ShippingProvidersListPage.tsx
//
// 仓库可用快递网点（列表页）
// 语义说明：
// - 本页面中的每一行，表示「一个服务某仓库区域、参与运费比价的快递网点」
// - 当前阶段：快递网点与快递品牌共表存储（不单独拆 Account）
// - 后续可平滑演进为 carrier_accounts
//
// ✅ Phase 6 第二刀：前端直读仓库事实
// - 所属仓库：直读 shipping_providers.warehouse_id（事实）
// - 仓库名称：仅做字典翻译（fetchWarehouses），不做跨表推导 / 聚合 / N+1

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ProvidersTable } from "./components/ProvidersTable";
import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

// ✅ 复用仓库域现有事实接口：仅用于“id -> 展示名称”的翻译
import { fetchWarehouses } from "../warehouses/api";
import type { WarehouseListItem } from "../warehouses/types";

import { useAuth } from "../../../shared/useAuth";

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  // 展示规范：B-01 河北一仓
  return code && name ? `${code} ${name}` : code || name || `WH-${w.id}`;
}

const ShippingProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const vm = useShippingProvidersPage();

  // ✅ 合同：配置域写权限统一用 config.store.write
  const { can } = useAuth();
  const canWrite = can("config.store.write");

  // ✅ 仓库字典（只做翻译，不做归属推导）
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);

  async function loadWarehouses() {
    setWarehousesLoading(true);
    setWarehousesError(null);
    try {
      const res = await fetchWarehouses();
      const list = (res?.data ?? []) as WarehouseListItem[];
      setWarehouses(list);
      return list;
    } catch (e) {
      console.error("load warehouses failed", e);
      setWarehouses([]);
      setWarehousesError("加载仓库列表失败");
      return [];
    } finally {
      setWarehousesLoading(false);
    }
  }

  const warehouseLabelById = useMemo(() => {
    const m: Record<number, string> = {};
    for (const w of warehouses ?? []) {
      m[w.id] = warehouseLabel(w);
    }
    return m;
  }, [warehouses]);

  useEffect(() => {
    void loadWarehouses();
  }, []);

  return (
    <div className={UI.page}>
      <PageTitle title="仓库可用快递网点" />

      <div className="mb-4 text-sm text-slate-600">参与指定仓库区域运费比价的快递网点配置（最小参与单元）</div>

      {!canWrite && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">你没有该页面的写权限（config.store.write）。可查看配置与事实，但不能新建/编辑/启停。</div>
        </div>
      )}

      <ProvidersTable
        canWrite={canWrite}
        providers={vm.providersHook.providers}
        loading={vm.providersHook.loading || vm.providersHook.toggling}
        error={vm.providersHook.error}
        onlyActive={vm.providersHook.onlyActive}
        onOnlyActiveChange={vm.providersHook.setOnlyActive}
        search={vm.providersHook.search}
        onSearchChange={vm.providersHook.setSearch}
        onRefresh={() => {
          void vm.providersHook.loadProviders();
          void loadWarehouses();
        }}
        onCreateProvider={() => navigate("/admin/shipping-providers/new")}
        onEditProvider={(p) => navigate(`/admin/shipping-providers/${p.id}/edit`)}
        onToggleProviderActive={(p) => {
          if (!canWrite) return;
          void vm.providersHook.toggleProviderActive(p);
        }}
        warehouseLabelById={warehouseLabelById}
        warehousesLoading={warehousesLoading}
        warehousesError={warehousesError}
      />
    </div>
  );
};

export default ShippingProvidersListPage;
