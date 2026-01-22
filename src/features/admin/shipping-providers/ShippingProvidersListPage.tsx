// src/features/admin/shipping-providers/ShippingProvidersListPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ProvidersTable } from "./components/ProvidersTable";
import { SchemesPanel } from "./components/SchemesPanel";
import EditProviderModal from "./modals/EditProviderModal";

import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

// ✅ 复用仓库域现有事实接口：不引入新后端能力
import { fetchWarehouses, fetchWarehouseShippingProviders } from "../warehouses/api";
import type { WarehouseListItem, WarehouseShippingProviderListItem } from "../warehouses/types";

import { useAuth } from "../../../shared/useAuth";

type ProviderWarehouseUsage = {
  qualifiedWarehouseLabels: string[]; // 具备服务资格
  activeWarehouseLabels: string[]; // 正在服务（资格 + active）
};

function warehouseLabel(w: WarehouseListItem): string {
  const code = w.code ? String(w.code).trim() : "";
  const name = w.name ? String(w.name).trim() : "";
  return code || name || `WH-${w.id}`;
}

function uniqSorted(xs: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs) {
    const v = (x ?? "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  out.sort((a, b) => a.localeCompare(b, "zh"));
  return out;
}

const ShippingProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const vm = useShippingProvidersPage();

  // ✅ 合同：配置域写权限统一用 config.store.write
  const { can } = useAuth();
  const canWrite = can("config.store.write");

  // ✅ 只读事实聚合：快递公司 -> 被哪些仓使用（资格/正在服务）
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usageByProviderId, setUsageByProviderId] = useState<Record<number, ProviderWarehouseUsage>>({});

  const providerIds = useMemo(
    () => (vm.providersHook.providers ?? []).map((p) => p.id).filter((x) => typeof x === "number"),
    [vm.providersHook.providers],
  );

  async function loadUsageFacts() {
    setUsageLoading(true);
    setUsageError(null);

    try {
      const res = await fetchWarehouses();
      const warehouses = (res?.data ?? []) as WarehouseListItem[];

      // 预置空 map，保证 UI 可稳定读取
      const init: Record<number, ProviderWarehouseUsage> = {};
      for (const pid of providerIds) {
        init[pid] = { qualifiedWarehouseLabels: [], activeWarehouseLabels: [] };
      }

      const pairs = await Promise.all(
        warehouses.map(async (w) => {
          try {
            const bindings = await fetchWarehouseShippingProviders(w.id);
            return [w, bindings] as [WarehouseListItem, WarehouseShippingProviderListItem[]];
          } catch (e) {
            console.warn("load warehouse shipping providers failed", w.id, e);
            return [w, []] as [WarehouseListItem, WarehouseShippingProviderListItem[]];
          }
        }),
      );

      for (const [w, bindings] of pairs) {
        const wLabel = warehouseLabel(w);

        for (const b of bindings) {
          const pid = b.shipping_provider_id;
          if (!init[pid]) init[pid] = { qualifiedWarehouseLabels: [], activeWarehouseLabels: [] };

          // 事实：具备服务资格（绑定存在）
          init[pid].qualifiedWarehouseLabels.push(wLabel);

          // 事实：正在服务（绑定 active + 快递主数据 active）
          if (b.active === true && b.provider?.active === true) {
            init[pid].activeWarehouseLabels.push(wLabel);
          }
        }
      }

      // 去重 + 排序
      const normalized: Record<number, ProviderWarehouseUsage> = {};
      for (const [k, v] of Object.entries(init)) {
        const pid = Number(k);
        normalized[pid] = {
          qualifiedWarehouseLabels: uniqSorted(v.qualifiedWarehouseLabels),
          activeWarehouseLabels: uniqSorted(v.activeWarehouseLabels),
        };
      }

      setUsageByProviderId(normalized);
    } catch (e) {
      console.error("load usage facts failed", e);
      setUsageError("加载“被哪些仓使用”失败");
      setUsageByProviderId({});
    } finally {
      setUsageLoading(false);
    }
  }

  // providers 列表变化后自动刷新（新增/启停后会 reload providers）
  useEffect(() => {
    if (!providerIds || providerIds.length === 0) {
      setUsageByProviderId({});
      return;
    }
    void loadUsageFacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerIds.join(",")]);

  return (
    <div className={UI.page}>
      <PageTitle title="物流 / 快递公司（主数据）" />

      {!canWrite && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
          <div className="font-semibold">当前为只读模式</div>
          <div className="text-sm opacity-80">
            你没有该页面的写权限（config.store.write）。可查看事实与配置，但不能创建/编辑/启停。
          </div>
        </div>
      )}

      {/* 新建物流/快递公司（主数据） */}
      <section className={UI.card}>
        <div className={UI.cardHeader}>
          <h2 className={`${UI.h2} font-semibold text-slate-900`}>新建物流/快递公司</h2>
          {vm.providersHook.createError ? <div className={UI.error}>{vm.providersHook.createError}</div> : null}
        </div>

        <form onSubmit={vm.providersHook.handleCreateProvider} className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className={UI.field}>
            <label className={UI.label}>公司名称 *</label>
            <input
              className={UI.input}
              value={vm.providersHook.name}
              onChange={(e) => vm.providersHook.setName(e.target.value)}
              disabled={!canWrite}
            />
          </div>

          <div className={UI.field}>
            <label className={UI.label}>编码</label>
            <input
              className={UI.inputMono}
              value={vm.providersHook.code}
              onChange={(e) => vm.providersHook.setCode(e.target.value)}
              disabled={!canWrite}
            />
          </div>

          <div className="flex items-end">
            <button type="submit" disabled={!canWrite || vm.providersHook.creating} className={UI.btnPrimary}>
              {vm.providersHook.creating ? "创建中…" : "创建"}
            </button>
          </div>
        </form>
      </section>

      {/* Providers + Charging Standards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
            void loadUsageFacts();
          }}
          selectedProviderId={vm.selectedProviderId}
          onSelectProviderForSchemes={(id) => void vm.selectProviderForSchemes(id)}
          onEditProvider={vm.openEditProvider}
          onToggleProviderActive={(p) => {
            if (!canWrite) return;
            void vm.providersHook.toggleProviderActive(p);
          }}
          usageByProviderId={usageByProviderId}
          usageLoading={usageLoading}
          usageError={usageError}
          onRefreshUsage={() => void loadUsageFacts()}
        />

        <SchemesPanel
          canWrite={canWrite}
          selectedProvider={vm.selectedProvider}
          schemes={vm.schemesHook.schemes}
          loadingSchemes={vm.schemesHook.loadingSchemes}
          schemesError={vm.schemesHook.schemesError}
          newSchemeName={vm.schemesHook.newSchemeName}
          newSchemeCurrency={vm.schemesHook.newSchemeCurrency}
          newSchemeSaving={vm.schemesHook.newSchemeSaving}
          onChangeName={vm.schemesHook.setNewSchemeName}
          onChangeCurrency={vm.schemesHook.setNewSchemeCurrency}
          onCreateScheme={() => canWrite && void vm.schemesHook.handleCreateScheme(vm.selectedProviderId)}
          onRefresh={() => vm.selectedProvider && void vm.schemesHook.loadSchemes(vm.selectedProvider.id)}
          onOpenWorkbench={(id) => navigate(`/admin/shipping-providers/schemes/${id}/workbench`)}
          onClearSelectedProvider={vm.clearProviderForSchemes}
          hasMultiActive={vm.schemesHook.hasMultiActive}
          fixingActive={vm.schemesHook.fixingActive}
          onFixMultiActive={() => canWrite && vm.selectedProviderId && void vm.schemesHook.fixMultiActive(vm.selectedProviderId)}
          settingActive={vm.schemesHook.settingActive}
          onSetActive={(schemeId) =>
            canWrite && vm.selectedProviderId && void vm.schemesHook.setActiveScheme(vm.selectedProviderId, schemeId)
          }
        />
      </div>

      {/* Provider 编辑弹窗 */}
      {vm.editOpen && vm.editingProvider ? (
        <EditProviderModal
          open={vm.editOpen}
          provider={vm.editingProvider}
          busy={vm.busyModal}
          savingProvider={vm.editSaving}
          savingContact={vm.cSaving}
          error={vm.editError}
          state={vm.form}
          onChange={vm.patchForm}
          onClose={vm.closeEditProvider}
          onSaveProvider={vm.saveEditProvider}
          onCreateContact={vm.createContact}
          onSetPrimary={vm.setPrimary}
          onToggleContactActive={vm.toggleContactActive}
          onRemoveContact={vm.removeContact}
        />
      ) : null}
    </div>
  );
};

export default ShippingProvidersListPage;
