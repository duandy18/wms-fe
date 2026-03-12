// src/features/admin/shipping-providers/scheme/workbench/cards/surcharges/types.ts
//
// 分拆说明：
// - 从 SurchargesCard.tsx 中抽出共享类型。
// - 当前只负责 surcharge 卡子组件之间的类型对齐。
// - 维护约束：
//   - 这里放“展示层共享类型”，不要塞 API DTO 和保存逻辑。

import type { GeoItem } from "../../../../api/geo";
import type { SurchargeConfigCityRow, SurchargeRuleRow } from "../../domain/types";

export type ProvinceSelection = {
  provinceCode: string;
  provinceName: string;
};

export type ProvinceBatchDraft = ProvinceSelection & {
  fixedAmount: string;
  active: boolean;
};

export type SurchargesCardProps = {
  disabled: boolean;
  saving: boolean;
  rows: SurchargeRuleRow[];
  provinceOptions: GeoItem[];
  provinceDrafts: ProvinceBatchDraft[];
  onAddProvinceDraft: (item: ProvinceSelection) => void;
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
    patch: Partial<Pick<SurchargeConfigCityRow, "cityCode" | "cityName" | "fixedAmount" | "active">>,
  ) => void;
  onRemoveCity: (clientId: string, cityClientId: string) => void;
};
