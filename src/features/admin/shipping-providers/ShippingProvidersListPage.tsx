// src/features/admin/shipping-providers/ShippingProvidersListPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

import PageTitle from "../../../components/ui/PageTitle";
import { UI } from "./ui";

import EditProviderModal from "./modals/EditProviderModal";
import { useShippingProvidersPage } from "./hooks/useShippingProvidersPage";

import CreateProviderCard from "./page/CreateProviderCard";
import ProvidersSchemesGrid from "./page/ProvidersSchemesGrid";

const ShippingProvidersListPage: React.FC = () => {
  const navigate = useNavigate();
  const vm = useShippingProvidersPage();

  return (
    <div className={UI.page}>
      <PageTitle title="物流与快递公司" />

      <CreateProviderCard
        createError={vm.providersHook.createError}
        creating={vm.providersHook.creating}
        name={vm.providersHook.name}
        code={vm.providersHook.code}
        setName={vm.providersHook.setName}
        setCode={vm.providersHook.setCode}
        onSubmit={vm.providersHook.handleCreateProvider}
      />

      <ProvidersSchemesGrid
        providers={vm.providersHook.providers}
        providersLoading={vm.providersHook.loading}
        providersError={vm.providersHook.error}
        onlyActive={vm.providersHook.onlyActive}
        onOnlyActiveChange={vm.providersHook.setOnlyActive}
        search={vm.providersHook.search}
        onSearchChange={vm.providersHook.setSearch}
        onRefreshProviders={() => void vm.providersHook.loadProviders()}
        selectedProviderId={vm.selectedProviderId}
        onSelectProviderForSchemes={(id) => void vm.selectProviderForSchemes(id)}
        onEditProvider={vm.openEditProvider}
        selectedProvider={vm.selectedProvider}
        schemes={vm.schemesHook.schemes}
        loadingSchemes={vm.schemesHook.loadingSchemes}
        schemesError={vm.schemesHook.schemesError}
        newSchemeName={vm.schemesHook.newSchemeName}
        newSchemePriority={vm.schemesHook.newSchemePriority}
        newSchemeCurrency={vm.schemesHook.newSchemeCurrency}
        newSchemeSaving={vm.schemesHook.newSchemeSaving}
        newSchemeDefaultMode={vm.schemesHook.newSchemeDefaultMode}
        onChangeDefaultMode={vm.schemesHook.setNewSchemeDefaultMode}
        onChangeName={vm.schemesHook.setNewSchemeName}
        onChangePriority={vm.schemesHook.setNewSchemePriority}
        onChangeCurrency={vm.schemesHook.setNewSchemeCurrency}
        onCreateScheme={() => void vm.schemesHook.handleCreateScheme(vm.selectedProviderId)}
        onRefreshSchemes={() => vm.selectedProvider && void vm.schemesHook.loadSchemes(vm.selectedProvider.id)}
        onOpenWorkbench={(id) => navigate(`/admin/shipping-providers/schemes/${id}/workbench?tab=pricing`)}
      />

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
