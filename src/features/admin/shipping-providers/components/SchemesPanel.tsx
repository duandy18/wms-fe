// src/features/admin/shipping-providers/components/SchemesPanel.tsx

import React, { useMemo, useState } from "react";
import { UI } from "../ui";
import { type PricingScheme, type ShippingProvider } from "../api";
import type { SchemeDefaultPricingMode } from "../api/types";
import { CUI } from "./ui";

import { isTestSchemeName } from "./SchemesPanel/utils";
import SchemesCreateCard from "./SchemesCreateCard";
import SchemesTable from "./SchemesTable";

type Props = {
  selectedProvider: ShippingProvider | null;

  schemes: PricingScheme[];
  loadingSchemes: boolean;
  schemesError: string | null;

  newSchemeName: string;
  newSchemePriority: string;
  newSchemeCurrency: string;
  newSchemeSaving: boolean;

  // ✅ 默认口径：不再在 Admin 暴露 UI，但上游 state 仍保留（避免牵连更多改动）
  newSchemeDefaultMode: SchemeDefaultPricingMode;
  onChangeDefaultMode: (v: SchemeDefaultPricingMode) => void;

  onChangeName: (v: string) => void;
  onChangePriority: (v: string) => void;
  onChangeCurrency: (v: string) => void;

  onCreateScheme: () => void;
  onRefresh: () => void;
  onOpenWorkbench: (schemeId: number) => void;
};

export const SchemesPanel: React.FC<Props> = ({
  selectedProvider,
  schemes,
  loadingSchemes,
  schemesError,
  newSchemeName,
  newSchemePriority,
  newSchemeCurrency,
  newSchemeSaving,
  newSchemeDefaultMode,
  onChangeDefaultMode,
  onChangeName,
  onChangePriority,
  onChangeCurrency,
  onCreateScheme,
  onRefresh,
  onOpenWorkbench,
}) => {
  const [showTestSchemes, setShowTestSchemes] = useState(false);

  const { visibleSchemes, testCount } = useMemo(() => {
    const tests = schemes.filter((s) => isTestSchemeName(s.name));
    const visible = showTestSchemes ? schemes : schemes.filter((s) => !isTestSchemeName(s.name));
    return { visibleSchemes: visible, testCount: tests.length };
  }, [schemes, showTestSchemes]);

  return (
    <section className={UI.card}>
      <div className={CUI.headRow}>
        <h2 className={`${UI.h2} ${CUI.title}`}>快递公司运费</h2>

        {selectedProvider ? (
          <div className={CUI.providerHint}>
            公司：<span className={CUI.mono}>{selectedProvider.name}</span>
          </div>
        ) : (
          <div className={CUI.providerNone}>请从左侧选择一个物流/快递公司</div>
        )}
      </div>

      {schemesError ? <div className={UI.error}>{schemesError}</div> : null}

      {!selectedProvider ? (
        <div className={CUI.emptyCard}>先选择公司，再录入/维护运费价格表。</div>
      ) : (
        <div className={CUI.stack}>
          <SchemesCreateCard
            newSchemeName={newSchemeName}
            newSchemePriority={newSchemePriority}
            newSchemeCurrency={newSchemeCurrency}
            newSchemeSaving={newSchemeSaving}
            newSchemeDefaultMode={newSchemeDefaultMode}
            onChangeDefaultMode={onChangeDefaultMode}
            onChangeName={onChangeName}
            onChangePriority={onChangePriority}
            onChangeCurrency={onChangeCurrency}
            onCreateScheme={onCreateScheme}
          />

          {/* 列表头 */}
          <div className={CUI.listHead}>
            <div className={CUI.listMeta}>
              {loadingSchemes ? (
                "加载中…"
              ) : (
                <>
                  共 <span className={CUI.mono}>{visibleSchemes.length}</span> 份运费价格表
                  {testCount > 0 ? (
                    <span className={CUI.listMetaMuted}>
                      （已隐藏 <span className={CUI.mono}>{testCount}</span> 份测试表）
                    </span>
                  ) : null}
                </>
              )}
            </div>

            <div className={CUI.listActionsRow}>
              {testCount > 0 ? (
                <label className={CUI.checkRow}>
                  <input
                    type="checkbox"
                    className={CUI.checkBox}
                    checked={showTestSchemes}
                    onChange={(e) => setShowTestSchemes(e.target.checked)}
                  />
                  显示测试表
                </label>
              ) : null}

              <button type="button" className={UI.btnSecondary} disabled={loadingSchemes} onClick={onRefresh}>
                刷新
              </button>
            </div>
          </div>

          <SchemesTable schemes={visibleSchemes} onOpenWorkbench={onOpenWorkbench} />
        </div>
      )}
    </section>
  );
};

export default SchemesPanel;
