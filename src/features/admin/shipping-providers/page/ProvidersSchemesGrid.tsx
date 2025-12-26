// src/features/admin/shipping-providers/page/ProvidersSchemesGrid.tsx

import React from "react";
import { UI } from "../ui";
import type { ShippingProvider, PricingScheme } from "../api";
import type { SchemeDefaultPricingMode } from "../api/types";
import { ProvidersTable } from "../components/ProvidersTable";
import { SchemesPanel } from "../components/SchemesPanel";

export type ProvidersSchemesGridProps = {
  providers: ShippingProvider[];
  providersLoading: boolean;
  providersError: string | null;

  onlyActive: boolean;
  onOnlyActiveChange: (v: boolean) => void;

  search: string;
  onSearchChange: (v: string) => void;

  onRefreshProviders: () => void;

  selectedProviderId: number | null;
  onSelectProviderForSchemes: (id: number) => void;
  onEditProvider: (p: ShippingProvider) => void;

  selectedProvider: ShippingProvider | null;

  schemes: PricingScheme[];
  loadingSchemes: boolean;
  schemesError: string | null;

  newSchemeName: string;
  newSchemePriority: string;
  newSchemeCurrency: string;
  newSchemeSaving: boolean;

  newSchemeDefaultMode: SchemeDefaultPricingMode;
  onChangeDefaultMode: (v: SchemeDefaultPricingMode) => void;

  onChangeName: (v: string) => void;
  onChangePriority: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreateScheme: () => void;
  onRefreshSchemes: () => void;
  onOpenWorkbench: (schemeId: number) => void;
};

export const ProvidersSchemesGrid: React.FC<ProvidersSchemesGridProps> = (props) => {
  // ✅ 运行时兜底：上游 hook 初始阶段可能出现 undefined（即便 TS 标注为数组）
  // 用 ?? [] 避免 any，也避免子组件 .length / .map 直接炸。
  const providers = props.providers ?? [];
  const schemes = props.schemes ?? [];

  return (
    <div className={UI.twoColGrid}>
      <ProvidersTable
        providers={providers}
        loading={props.providersLoading}
        error={props.providersError}
        onlyActive={props.onlyActive}
        onOnlyActiveChange={props.onOnlyActiveChange}
        search={props.search}
        onSearchChange={props.onSearchChange}
        onRefresh={props.onRefreshProviders}
        selectedProviderId={props.selectedProviderId}
        onSelectProviderForSchemes={props.onSelectProviderForSchemes}
        onEditProvider={props.onEditProvider}
      />

      <SchemesPanel
        selectedProvider={props.selectedProvider}
        schemes={schemes}
        loadingSchemes={props.loadingSchemes}
        schemesError={props.schemesError}
        newSchemeName={props.newSchemeName}
        newSchemePriority={props.newSchemePriority}
        newSchemeCurrency={props.newSchemeCurrency}
        newSchemeSaving={props.newSchemeSaving}
        newSchemeDefaultMode={props.newSchemeDefaultMode}
        onChangeDefaultMode={props.onChangeDefaultMode}
        onChangeName={props.onChangeName}
        onChangePriority={props.onChangePriority}
        onChangeCurrency={props.onChangeCurrency}
        onCreateScheme={props.onCreateScheme}
        onRefresh={props.onRefreshSchemes}
        onOpenWorkbench={props.onOpenWorkbench}
      />
    </div>
  );
};

export default ProvidersSchemesGrid;
