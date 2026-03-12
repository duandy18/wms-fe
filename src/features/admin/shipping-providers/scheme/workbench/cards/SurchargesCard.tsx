// src/features/admin/shipping-providers/scheme/workbench/cards/SurchargesCard.tsx
//
// 分拆说明：
// - 从原先超长 surcharge 卡片文件继续拆分而来。
// - 当前文件只负责：
//   1) surcharge 卡整体壳子
//   2) 省级 / 城市配置两大区块编排
//   3) 将父层动作透传给子组件
// - 当前不负责：
//   1) 候选省份搜索与待创建列表细节
//   2) 城市配置创建器内部选择逻辑
//   3) 单张省级配置卡 / 城市配置卡内部布局
//   4) 城市子项编辑器细节
// - 协作关系：
//   - ./surcharges/types
//   - ./surcharges/utils
//   - ./surcharges/ProvinceBatchCreator
//   - ./surcharges/CityConfigCreator
//   - ./surcharges/CitySurchargeCardEditor
// - 维护约束：
//   - 本文件保持为 surcharge 卡“页面壳”定位，不再回涨成 800+ 行杂货铺。
//   - 业务真相仍在 state/surcharges.ts；本文件只做展示与动作分发。

import React from "react";
import type { GeoItem } from "../../../api/geo";
import { UI } from "../../ui";
import type { SurchargeRuleRow } from "../domain/types";
import type { ProvinceBatchDraft, ProvinceSelection } from "./surcharges/types";
import { collectExistingProvinceCodes } from "./surcharges/utils";
import ProvinceBatchCreator from "./surcharges/ProvinceBatchCreator";
import CityConfigCreator from "./surcharges/CityConfigCreator";
import CitySurchargeCardEditor from "./surcharges/CitySurchargeCardEditor";

type Props = {
  disabled: boolean;
  saving: boolean;
  rows: SurchargeRuleRow[];
  provinceOptions: GeoItem[];
  provinceDrafts: ProvinceBatchDraft[];
  provinceErrorMessage: string | null;
  cityErrorByClientId: Record<string, string | null>;
  onAddProvinceDraft: (item: { provinceCode: string; provinceName: string }) => void;
  onUpdateProvinceDraft: (
    provinceCode: string,
    patch: Partial<Pick<ProvinceBatchDraft, "fixedAmount" | "active">>,
  ) => void;
  onRemoveProvinceDraft: (provinceCode: string) => void;
  onClearProvinceDrafts: () => void;
  onSaveProvinceWorkspace: () => Promise<boolean>;
  onCreateCityGroup: (item: ProvinceSelection) => Promise<boolean>;
  onSaveCityRow: (clientId: string) => Promise<boolean>;
  onUpdateRow: (
    clientId: string,
    patch: Partial<
      Pick<
        SurchargeRuleRow,
        "provinceCode" | "provinceName" | "provinceMode" | "fixedAmount" | "active" | "cities"
      >
    >,
  ) => void;
  onRemoveRow: (clientId: string) => void;
  onAddCityToRow: (clientId: string) => void;
  onUpdateCity: (
    clientId: string,
    cityClientId: string,
    patch: Partial<{
      cityCode: string;
      cityName: string;
      fixedAmount: string;
      active: boolean;
    }>,
  ) => void;
  onRemoveCity: (clientId: string, cityClientId: string) => void;
};

export const SurchargesCard: React.FC<Props> = React.memo(
  ({
    disabled,
    saving,
    rows,
    provinceOptions,
    provinceDrafts,
    provinceErrorMessage,
    cityErrorByClientId,
    onAddProvinceDraft,
    onUpdateProvinceDraft,
    onRemoveProvinceDraft,
    onClearProvinceDrafts,
    onSaveProvinceWorkspace,
    onCreateCityGroup,
    onSaveCityRow,
    onUpdateRow,
    onRemoveRow,
    onAddCityToRow,
    onUpdateCity,
    onRemoveCity,
  }) => {
    const provinceRows = rows.filter((x) => x.provinceMode === "province");
    const aliveRows = rows.filter((x) => !x.isDeleted);
    const aliveProvinceRows = provinceRows.filter((x) => !x.isDeleted);
    const cityRows = aliveRows.filter((x) => x.provinceMode === "cities");

    const existingProvinceCodes = React.useMemo(
      () => collectExistingProvinceCodes(aliveRows),
      [aliveRows],
    );

    return (
      <div className={`${UI.cardTight} [overflow-anchor:none]`}>
        <div className={UI.headerRow}>
          <div>
            <div className={UI.panelTitle}>4）附加费</div>
            <div className={UI.panelHint}>
              已切到 surcharge_config 终态模型：省级附加费在右侧统一编辑并整体保存，城市附加费继续按容器卡单独保存。
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          <section className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">省级附加费</div>
              <div className="mt-1 text-xs text-slate-500">
                用于“全省统一收费”。左侧选择省份加入右侧编辑区，在右侧统一维护金额与启用状态后整体保存。
              </div>
            </div>

            <ProvinceBatchCreator
              disabled={disabled}
              saving={saving}
              errorMessage={provinceErrorMessage}
              options={provinceOptions}
              existingProvinceCodes={existingProvinceCodes}
              savedRows={aliveProvinceRows}
              selectedItems={provinceDrafts}
              onAddDraft={onAddProvinceDraft}
              onUpdateDraft={onUpdateProvinceDraft}
              onRemoveDraft={onRemoveProvinceDraft}
              onClearDrafts={onClearProvinceDrafts}
              onSaveWorkspace={onSaveProvinceWorkspace}
              onUpdateSavedRow={onUpdateRow}
              onRemoveSavedRow={onRemoveRow}
            />
          </section>

          <section className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">城市附加费</div>
              <div className="mt-1 text-xs text-slate-500">
                用于“省内部分城市收费”。先选一个省创建容器卡，再维护该省的城市子项。
              </div>
            </div>

            <CityConfigCreator
              disabled={disabled}
              saving={saving}
              options={provinceOptions}
              existingProvinceCodes={existingProvinceCodes}
              onConfirm={onCreateCityGroup}
            />

            {cityRows.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                当前还没有城市附加费配置。
              </div>
            ) : (
              cityRows.map((row) => (
                <CitySurchargeCardEditor
                  key={row.clientId}
                  row={row}
                  disabled={disabled}
                  saving={saving}
                  errorMessage={cityErrorByClientId[row.clientId] ?? null}
                  onSaveRow={onSaveCityRow}
                  onUpdateRow={onUpdateRow}
                  onRemoveRow={onRemoveRow}
                  onAddCityToRow={onAddCityToRow}
                  onUpdateCity={onUpdateCity}
                  onRemoveCity={onRemoveCity}
                />
              ))
            )}
          </section>

          {aliveRows.length === 0 ? (
            <div className={UI.emptyText}>当前方案暂无附加费配置。</div>
          ) : null}
        </div>
      </div>
    );
  },
);

SurchargesCard.displayName = "SurchargesCard";

export default SurchargesCard;
