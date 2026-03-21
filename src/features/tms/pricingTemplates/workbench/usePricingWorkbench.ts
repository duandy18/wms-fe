// src/features/tms/pricingTemplates/workbench/usePricingWorkbench.ts
//
// 分拆说明：
// - 本文件是“运价模板工作台主 hook 装配层”，由原先超长单文件状态总控继续收口而来。
// - 当前只负责：
//   1) 挂接 React 状态
//   2) 装配 ranges / groups / matrix / surcharge_configs 四块状态
//   3) 装配加载与子域动作
//   4) 输出统一 workbench API 给页面壳使用
// - 当前不负责：
//   1) DTO -> 前端行状态的 mapper 细节
//   2) 各子域保存 payload 拼装
//   3) 各子域局部状态修改实现
// - 协作关系：
//   - ./state/mappers
//   - ./state/modules
//   - ./state/ranges
//   - ./state/groups
//   - ./state/matrix
//   - ./state/surcharges
// - 维护约束：
//   - 后续不要再把大段子域逻辑塞回本文件。
//   - 本文件应保持“装配层”定位，而不是重新膨胀为杂货铺。

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PricingTemplateDetail } from "../types";
import { deriveWorkbenchState } from "./domain/derived";
import type {
  CitySaveFeedbackMap,
  GroupRow,
  MatrixCellDraft,
  ModuleEditorState,
  RangeRow,
  SaveFeedback,
  SurchargeRuleRow,
} from "./domain/types";
import { mapSurchargeConfigApiListToRows } from "./state/mappers";
import { useModuleLoadActions } from "./state/modules";
import { useRangesActions } from "./state/ranges";
import { useGroupsActions } from "./state/groups";
import { useMatrixActions } from "./state/matrix";
import { useSurchargeActions } from "./state/surcharges";

export function usePricingWorkbench(args: {
  detail: PricingTemplateDetail;
  disabled?: boolean;
}) {
  const { detail, disabled = false } = args;

  const [loading, setLoading] = useState(false);

  const [ranges, setRanges] = useState<RangeRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [cells, setCells] = useState<Record<string, MatrixCellDraft>>({});

  const [surcharges, setSurcharges] = useState<SurchargeRuleRow[]>([]);
  const [savingRanges, setSavingRanges] = useState(false);
  const [savingGroups, setSavingGroups] = useState(false);
  const [savingCells, setSavingCells] = useState(false);
  const [savingSurcharges, setSavingSurcharges] = useState(false);

  const [provinceLoading, setProvinceLoading] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [rangesFeedback, setRangesFeedback] = useState<SaveFeedback>({
    error: null,
    success: null,
  });
  const [groupsFeedback, setGroupsFeedback] = useState<SaveFeedback>({
    error: null,
    success: null,
  });
  const [matrixFeedback, setMatrixFeedback] = useState<SaveFeedback>({
    error: null,
    success: null,
  });
  const [provinceSurchargeFeedback, setProvinceSurchargeFeedback] = useState<SaveFeedback>({
    error: null,
    success: null,
  });
  const [citySurchargeFeedbackByClientId, setCitySurchargeFeedbackByClientId] =
    useState<CitySaveFeedbackMap>({});

  const { loadAll } = useModuleLoadActions({
    templateId: detail.id,
    setLoading,
    setRanges,
    setGroups,
    setCells,
    setLoadError,
  });

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    setSurcharges(mapSurchargeConfigApiListToRows(detail.surcharge_configs ?? []));
    setProvinceSurchargeFeedback({ error: null, success: null });
    setCitySurchargeFeedbackByClientId({});
  }, [detail.surcharge_configs]);

  const {
    addRange,
    updateRangeField,
    removeRange,
    saveRanges,
  } = useRangesActions({
    templateId: detail.id,
    disabled,
    ranges,
    setRanges,
    setCells,
    setSavingRanges,
    setRangesFeedback,
  });

  const {
    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupMembers,
    saveGroupRow,
  } = useGroupsActions({
    templateId: detail.id,
    disabled,
    groups,
    setGroups,
    setCells,
    setSavingGroups,
    setGroupsFeedback,
  });

  const {
    updateCellMode,
    updateCellField,
    toggleCellActive,
    saveCells,
  } = useMatrixActions({
    templateId: detail.id,
    disabled,
    ranges,
    groups,
    cells,
    setCells,
    setSavingCells,
    setMatrixFeedback,
  });

  const {
    provinceDrafts,
    addProvinceDraft,
    updateProvinceDraft,
    removeProvinceDraft,
    clearProvinceDrafts,
    createCitySurchargeGroup,
    updateSurchargeRow,
    removeSurchargeRow,
    addCityToSurchargeRow,
    updateSurchargeCity,
    removeSurchargeCity,
    saveProvinceWorkspace: rawSaveProvinceWorkspace,
    saveCityRow: rawSaveCityRow,
  } = useSurchargeActions({
    templateId: detail.id,
    disabled,
    surcharges,
    setSurcharges,
    setSavingSurcharges,
    setError: setLoadError,
    setSuccess: () => undefined,
  });

  const saveProvinceWorkspace = useCallback(async () => {
    setProvinceSurchargeFeedback({ error: null, success: null });

    const result = await rawSaveProvinceWorkspace();

    setProvinceSurchargeFeedback({
      error: result.error,
      success: result.success,
    });

    return result.ok;
  }, [rawSaveProvinceWorkspace]);

  const saveCityRow = useCallback(
    async (clientId: string) => {
      setCitySurchargeFeedbackByClientId((prev) => ({
        ...prev,
        [clientId]: { error: null, success: null },
      }));

      const result = await rawSaveCityRow(clientId);

      setCitySurchargeFeedbackByClientId((prev) => ({
        ...prev,
        [clientId]: {
          error: result.error,
          success: result.success,
        },
      }));

      return result.ok;
    },
    [rawSaveCityRow],
  );

  const derived = useMemo(
    () =>
      deriveWorkbenchState({
        ranges,
        groups,
        cells,
        surcharges,
      }),
    [cells, groups, ranges, surcharges],
  );

  const moduleState: ModuleEditorState = useMemo(
    () => ({
      loading,
      savingRanges,
      savingGroups,
      savingCells,
      error: loadError,
      ranges,
      groups,
      cells,
    }),
    [cells, groups, loadError, loading, ranges, savingCells, savingGroups, savingRanges],
  );

  return {
    moduleState,

    loading,
    ranges,
    groups,
    cells,

    surcharges,
    provinceDrafts,
    savingRanges,
    savingGroups,
    savingCells,
    savingSurcharges,

    provinceLoading,
    setProvinceLoading,

    loadError,
    setLoadError,

    rangesFeedback,
    setRangesFeedback,
    groupsFeedback,
    setGroupsFeedback,
    matrixFeedback,
    setMatrixFeedback,
    provinceSurchargeFeedback,
    setProvinceSurchargeFeedback,
    citySurchargeFeedbackByClientId,
    setCitySurchargeFeedbackByClientId,

    derived,

    loadAll,

    addRange,
    updateRangeField,
    removeRange,
    saveRanges,

    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupMembers,
    saveGroupRow,

    updateCellMode,
    updateCellField,
    toggleCellActive,
    saveCells,

    addProvinceDraft,
    updateProvinceDraft,
    removeProvinceDraft,
    clearProvinceDrafts,
    createCitySurchargeGroup,
    updateSurchargeRow,
    removeSurchargeRow,
    addCityToSurchargeRow,
    updateSurchargeCity,
    removeSurchargeCity,
    saveProvinceWorkspace,
    saveCityRow,
  };
}

export default usePricingWorkbench;
