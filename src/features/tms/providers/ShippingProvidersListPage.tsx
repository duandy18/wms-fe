// src/features/tms/providers/ShippingProvidersListPage.tsx
//
// 快递网点列表页（主数据入口）
//
// 语义说明：
// - 本页面只负责“快递网点”主数据管理。
// - 列表页只做两件事：
//   1) 列表展示
//   2) 进入“新建 / 编辑网点”页面
// - 网点编辑页只维护：
//   1) 基础信息
//   2) 联系人
// - 仓库绑定、运价创建、工作台入口，统一收敛到 Pricing 页。
// - 当前阶段：快递网点与快递品牌共表存储（不单独拆 Account）
// - 后续可平滑演进为 carrier_accounts
//
// 真相优先：
// - 这里展示的是网点主数据列表；
// - 运营层面的“网点 × 仓库 × 运价状态”总览，统一在“运价管理”页面处理。
// - 列表页不再使用历史 warehouse_id 伪装单仓归属，避免误导。

import React from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ProvidersTable } from "./components/ProvidersTable";
import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

import { useAuth } from "../../../shared/useAuth";

const ShippingProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const vm = useShippingProvidersPage();

  const { can } = useAuth();
  const canWrite = can("config.store.write");

  return (
    <div className={UI.page}>
      <PageTitle title="快递网点" />

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div className="text-sm text-slate-700">
          本页维护快递网点主数据。进入编辑页后，只维护
          <span className="font-semibold text-slate-900">
            基础信息、联系人
          </span>
          两块内容。
        </div>
        <div className="mt-2 text-sm text-slate-500">
          仓库绑定、运价创建、运价工作台入口，已统一收敛到“运价管理”页面。
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
        }}
        onCreateProvider={() => navigate("/tms/providers/new")}
        onEditProvider={(p) => navigate(`/tms/providers/${p.id}/edit`)}
        onToggleProviderActive={(p) => {
          if (!canWrite) return;
          void vm.providersHook.toggleProviderActive(p);
        }}
      />
    </div>
  );
};

export default ShippingProvidersListPage;
