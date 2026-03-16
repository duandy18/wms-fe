// src/features/tms/providers/ShippingProvidersListPage.tsx
//
// 快递网点列表页（物流配置入口）
// 语义说明：
// - 本页面是“快递网点”业务的入口页，不承担联系人 / 仓库绑定 / 运价方案的深度编辑。
// - 点击“编辑网点”后进入网点配置容器页，在同一页面内维护：
//   1) 基础信息
//   2) 联系人
//   3) 仓库绑定
//   4) 运价方案
// - 运价方案的深度编辑继续进入 workbench-flow 工作台。
// - 当前阶段：快递网点与快递品牌共表存储（不单独拆 Account）
// - 后续可平滑演进为 carrier_accounts
//
// ✅ 当前页面只做两件事：
// - 列表展示
// - 进入“新建 / 编辑网点”主容器
//
// ✅ 仓库字典用途：
// - 这里只做“id -> 展示名称”的翻译，不做任何跨表推导 / 聚合 / 归属裁决。

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ProvidersTable } from "./components/ProvidersTable";
import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

// ✅ 复用仓库域现有事实接口：仅用于“id -> 展示名称”的翻译
import { fetchWarehouses } from "../../admin/warehouses/api";
import type { WarehouseListItem } from "../../admin/warehouses/types";

import { useAuth } from "../../../shared/useAuth";

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
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
      <PageTitle title="快递网点" />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="text-sm text-slate-700">
          本页是物流配置入口：先选择或新建快递网点，再进入网点配置页维护
          <span className="font-semibold text-slate-900">基础信息、联系人、仓库绑定、运价方案</span> 四块内容。
        </div>
        <div className="mt-2 text-sm text-slate-500">
          这里展示的是网点列表；深度编辑不在列表页完成，而在“编辑网点”页面内收口。
        </div>
      </div>

      {!canWrite && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">
            你没有该页面的写权限（config.store.write）。可查看配置与事实，但不能新建/编辑/启停。
          </div>
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
        onCreateProvider={() => navigate("/tms/providers/new")}
        onEditProvider={(p) => navigate(`/tms/providers/${p.id}/edit`)}
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
