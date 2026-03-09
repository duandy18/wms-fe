// src/features/admin/shipping-providers/scheme/workbench/state/ranges.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“重量段”子域动作：新增 / 修改 / 删除 / 保存。
// - 当前不负责：
//   1) groups / matrix / surcharges 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 依赖 ../domain/derived 做排序、校验与文本转换
// - 维护约束：
//   - 本文件聚焦重量段，不要吸收别的子域动作。

import { useCallback } from "react";
import { putModuleRanges } from "../api/modules";
import type { ModuleCode } from "../api/types";
import {
  newClientId,
  sortRanges,
  validateRangeRows,
} from "../domain/derived";
import type { ModuleEditorState, RangeRow } from "../domain/types";
import { mapRangeApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  getModuleState: (moduleCode: ModuleCode) => ModuleEditorState;
  setModuleState: (moduleCode: ModuleCode, updater: (prev: ModuleEditorState) => ModuleEditorState) => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export function useRangesActions(args: Args) {
  const { schemeId, disabled, getModuleState, setModuleState, setError, setSuccess } = args;

  const addRange = useCallback(
    (moduleCode: ModuleCode) => {
      setModuleState(moduleCode, (prev) => {
        const alive = prev.ranges.filter((r) => !r.isDeleted);
        const last = sortRanges(alive).slice(-1)[0] ?? null;
        const nextMin = last ? (last.maxKg.trim() || last.minKg.trim() || "0") : "0";

        const next: RangeRow = {
          id: undefined,
          clientId: newClientId(`range:${moduleCode}`),
          minKg: nextMin,
          maxKg: "",
          sortOrder: alive.length,
          isNew: true,
          isDirty: true,
          isDeleted: false,
        };

        return {
          ...prev,
          ranges: sortRanges([...prev.ranges, next]),
        };
      });
    },
    [setModuleState],
  );

  const updateRangeField = useCallback(
    (moduleCode: ModuleCode, clientId: string, field: "minKg" | "maxKg", value: string) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        ranges: prev.ranges.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                [field]: value,
                isDirty: true,
              }
            : row,
        ),
      }));
    },
    [setModuleState],
  );

  const removeRange = useCallback(
    (moduleCode: ModuleCode, clientId: string) => {
      setModuleState(moduleCode, (prev) => {
        const alive = prev.ranges.filter((r) => !r.isDeleted);
        if (alive.length <= 1) return prev;

        return {
          ...prev,
          ranges: prev.ranges.map((row) =>
            row.clientId === clientId
              ? {
                  ...row,
                  isDeleted: true,
                  isDirty: true,
                }
              : row,
          ),
        };
      });
    },
    [setModuleState],
  );

  const saveRanges = useCallback(
    async (moduleCode: ModuleCode) => {
      if (disabled) return false;

      const moduleState = getModuleState(moduleCode);
      const errors = validateRangeRows(moduleState.ranges);
      if (errors.length > 0) {
        setError(errors[0]);
        return false;
      }

      setModuleState(moduleCode, (prev) => ({
        ...prev,
        savingRanges: true,
        error: null,
      }));
      setError(null);
      setSuccess(null);

      try {
        const alive = sortRanges(moduleState.ranges.filter((r) => !r.isDeleted));
        const payload = {
          ranges: alive.map((row, idx) => ({
            min_kg: Number(row.minKg.trim()),
            max_kg: row.maxKg.trim() ? Number(row.maxKg.trim()) : null,
            sort_order: idx,
          })),
        };

        const resp = await putModuleRanges(schemeId, moduleCode, payload);

        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingRanges: false,
          ranges: sortRanges((resp.ranges ?? []).map(mapRangeApiToRow)),
          cells: {},
        }));

        setSuccess(
          `${moduleCode === "standard" ? "标准区域" : "其他区域"}重量段已保存；该模块矩阵已清空，需要重新录入后保存。`,
        );
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存重量段失败";
        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingRanges: false,
          error: msg,
        }));
        setError(msg);
        return false;
      }
    },
    [disabled, getModuleState, schemeId, setError, setModuleState, setSuccess],
  );

  return {
    addRange,
    updateRangeField,
    removeRange,
    saveRanges,
  };
}
