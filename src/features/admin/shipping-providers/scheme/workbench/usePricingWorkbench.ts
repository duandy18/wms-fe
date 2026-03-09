// src/features/admin/shipping-providers/scheme/workbench/usePricingWorkbench.ts
//
// 分拆说明：
// - 本文件是“运价工作台主 hook 装配层”，由原先超长单文件状态总控继续收口而来。
// - 当前只负责：
//   1) 挂接 React 状态
//   2) 组装 standard / other / surcharges 三块状态
//   3) 装配 modules / ranges / groups / matrix / surcharges 子域动作
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
import type { PricingSchemeDetail } from "../../api/types";
import { deriveWorkbenchState } from "./domain/derived";
import type { ModuleCode, PricingMode } from "./api/types";
import type { ModuleEditorState, SurchargeRuleRow } from "./domain/types";
import { emptyModuleState, mapSurchargeApiToRow } from "./state/mappers";
import { useModuleLoadActions } from "./state/modules";
import { useRangesActions } from "./state/ranges";
import { useGroupsActions } from "./state/groups";
import { useMatrixActions } from "./state/matrix";
import { useSurchargeActions } from "./state/surcharges";

export function usePricingWorkbench(args: {
  detail: PricingSchemeDetail;
  disabled?: boolean;
}) {
  const { detail, disabled = false } = args;

  const [activeModuleCode, setActiveModuleCode] = useState<ModuleCode>("standard");

  const [standard, setStandard] = useState<ModuleEditorState>(() => emptyModuleState("standard"));
  const [other, setOther] = useState<ModuleEditorState>(() => emptyModuleState("other"));

  const [surcharges, setSurcharges] = useState<SurchargeRuleRow[]>([]);
  const [savingSurcharges, setSavingSurcharges] = useState(false);

  const [provinceLoading, setProvinceLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setModuleState = useCallback(
    (moduleCode: ModuleCode, updater: (prev: ModuleEditorState) => ModuleEditorState) => {
      if (moduleCode === "standard") {
        setStandard((prev) => updater(prev));
      } else {
        setOther((prev) => updater(prev));
      }
    },
    [],
  );

  const getModuleState = useCallback(
    (moduleCode: ModuleCode): ModuleEditorState => {
      return moduleCode === "standard" ? standard : other;
    },
    [other, standard],
  );

  const { loadModule, loadAll } = useModuleLoadActions({
    schemeId: detail.id,
    setModuleState,
    setError,
  });

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    setSurcharges((detail.surcharges ?? []).map(mapSurchargeApiToRow));
  }, [detail.surcharges]);

  const currentModule = activeModuleCode === "standard" ? standard : other;

  const {
    addRange,
    updateRangeField,
    removeRange,
    saveRanges,
  } = useRangesActions({
    schemeId: detail.id,
    disabled,
    getModuleState,
    setModuleState,
    setError,
    setSuccess,
  });

  const {
    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupProvinces,
    saveGroups,
  } = useGroupsActions({
    schemeId: detail.id,
    disabled,
    getModuleState,
    setModuleState,
    setError,
    setSuccess,
  });

  const {
    updateCellMode,
    updateCellField,
    toggleCellActive,
    saveCells,
  } = useMatrixActions({
    schemeId: detail.id,
    disabled,
    getModuleState,
    setModuleState,
    setError,
    setSuccess,
  });

  const {
    addSurchargeRow,
    updateSurchargeRow,
    removeSurchargeRow,
    saveSurcharges,
  } = useSurchargeActions({
    schemeId: detail.id,
    disabled,
    surcharges,
    setSurcharges,
    setSavingSurcharges,
    setError,
    setSuccess,
  });

  const derived = useMemo(
    () =>
      deriveWorkbenchState({
        activeModuleCode,
        standard,
        other,
        surcharges,
      }),
    [activeModuleCode, other, standard, surcharges],
  );

  return {
    activeModuleCode,
    setActiveModuleCode,

    standard,
    other,
    currentModule,

    surcharges,
    savingSurcharges,

    provinceLoading,
    setProvinceLoading,

    error,
    setError,
    success,
    setSuccess,

    derived,

    loadAll,
    loadModule,

    addRange,
    updateRangeField,
    removeRange,
    saveRanges,

    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupProvinces,
    saveGroups,

    updateCellMode: (
      moduleCode: ModuleCode,
      groupId: number,
      moduleRangeId: number,
      mode: PricingMode,
    ) => updateCellMode(moduleCode, groupId, moduleRangeId, mode),
    updateCellField: (
      moduleCode: ModuleCode,
      groupId: number,
      moduleRangeId: number,
      field: "flatAmount" | "baseAmount" | "ratePerKg" | "baseKg",
      value: string,
    ) => updateCellField(moduleCode, groupId, moduleRangeId, field, value),
    toggleCellActive,
    saveCells,

    addSurchargeRow,
    updateSurchargeRow,
    removeSurchargeRow,
    saveSurcharges,
  };
}

export default usePricingWorkbench;
