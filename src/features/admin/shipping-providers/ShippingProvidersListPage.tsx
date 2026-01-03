// src/features/admin/shipping-providers/ShippingProvidersListPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import { ProvidersTable } from "./components/ProvidersTable";
import { SchemesPanel } from "./components/SchemesPanel";
import EditProviderModal from "./modals/EditProviderModal";

import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

const ShippingProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const vm = useShippingProvidersPage();

  return (
    <div className={UI.page}>
      <PageTitle title="物流 / 快递公司（主数据）" />

      {/* 新建 provider */}
      <section className={UI.card}>
        <div className={UI.cardHeader}>
          <h2 className={`${UI.h2} font-semibold text-slate-900`}>新建物流/快递公司</h2>
          {vm.providersHook.createError && <div className={UI.error}>{vm.providersHook.createError}</div>}
        </div>

        <form onSubmit={vm.providersHook.handleCreateProvider} className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className={UI.field}>
            <label className={UI.label}>公司名称 *</label>
            <input
              className={UI.input}
              value={vm.providersHook.name}
              onChange={(e) => vm.providersHook.setName(e.target.value)}
            />
          </div>
          <div className={UI.field}>
            <label className={UI.label}>编码</label>
            <input
              className={UI.inputMono}
              value={vm.providersHook.code}
              onChange={(e) => vm.providersHook.setCode(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={vm.providersHook.creating} className={UI.btnPrimary}>
              {vm.providersHook.creating ? "创建中…" : "创建"}
            </button>
          </div>
        </form>
      </section>

      {/* Providers + Schemes */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProvidersTable
          providers={vm.providersHook.providers}
          loading={vm.providersHook.loading}
          error={vm.providersHook.error}
          onlyActive={vm.providersHook.onlyActive}
          onOnlyActiveChange={vm.providersHook.setOnlyActive}
          search={vm.providersHook.search}
          onSearchChange={vm.providersHook.setSearch}
          onRefresh={() => void vm.providersHook.loadProviders()}
          selectedProviderId={vm.selectedProviderId}
          onSelectProviderForSchemes={(id) => void vm.selectProviderForSchemes(id)}
          onEditProvider={vm.openEditProvider}
        />

        <SchemesPanel
          selectedProvider={vm.selectedProvider}
          schemes={vm.schemesHook.schemes}
          loadingSchemes={vm.schemesHook.loadingSchemes}
          schemesError={vm.schemesHook.schemesError}
          newSchemeName={vm.schemesHook.newSchemeName}
          newSchemePriority={vm.schemesHook.newSchemePriority}
          newSchemeCurrency={vm.schemesHook.newSchemeCurrency}
          newSchemeSaving={vm.schemesHook.newSchemeSaving}
          onChangeName={vm.schemesHook.setNewSchemeName}
          onChangePriority={vm.schemesHook.setNewSchemePriority}
          onChangeCurrency={vm.schemesHook.setNewSchemeCurrency}
          onCreateScheme={() => void vm.schemesHook.handleCreateScheme(vm.selectedProviderId)}
          onRefresh={() => vm.selectedProvider && void vm.schemesHook.loadSchemes(vm.selectedProvider.id)}
          onOpenWorkbench={(id) => navigate(`/admin/shipping-providers/schemes/${id}/workbench`)}
          onClearSelectedProvider={vm.clearProviderForSchemes}
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
