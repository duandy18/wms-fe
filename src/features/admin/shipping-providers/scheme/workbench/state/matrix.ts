// src/features/admin/shipping-providers/scheme/workbench/state/matrix.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“价格矩阵”子域动作：
//   1) 单元格模式切换
//   2) 单元格字段更新
//   3) 单元格启用状态切换
//   4) 保存矩阵 cells
// - 当前不负责：
//   1) ranges / groups / surcharges 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 依赖 ../domain/derived 完成 key、空草稿、校验等处理
// - 维护约束：
//   - 单元格状态真相收口在这里；不要把 matrix 保存逻辑散回 UI 组件。

import { useCallback } from "react";
import { putModuleMatrixCells } from "../api/modules";
import type { ModuleCode, PricingMode } from "../api/types";
import {
  buildCellKey,
  createEmptyCellDraft,
  normalizeCellDraftMode,
  parseRequiredNumber,
  sortGroups,
  sortRanges,
  validateMatrixCellDraft,
} from "../domain/derived";
import type { ModuleEditorState } from "../domain/types";
import { mapCellApiToDraft } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  getModuleState: (moduleCode: ModuleCode) => ModuleEditorState;
  setModuleState: (moduleCode: ModuleCode, updater: (prev: ModuleEditorState) => ModuleEditorState) => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export function useMatrixActions(args: Args) {
  const { schemeId, disabled, getModuleState, setModuleState, setError, setSuccess } = args;

  const updateCellMode = useCallback(
    (moduleCode: ModuleCode, groupId: number, moduleRangeId: number, mode: PricingMode) => {
      setModuleState(moduleCode, (prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current = prev.cells[key] ?? createEmptyCellDraft(groupId, moduleRangeId);
        return {
          ...prev,
          cells: {
            ...prev.cells,
            [key]: {
              ...normalizeCellDraftMode(current, mode),
              isDirty: true,
            },
          },
        };
      });
    },
    [setModuleState],
  );

  const updateCellField = useCallback(
    (
      moduleCode: ModuleCode,
      groupId: number,
      moduleRangeId: number,
      field: "flatAmount" | "baseAmount" | "ratePerKg" | "baseKg",
      value: string,
    ) => {
      setModuleState(moduleCode, (prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current = prev.cells[key] ?? createEmptyCellDraft(groupId, moduleRangeId);

        return {
          ...prev,
          cells: {
            ...prev.cells,
            [key]: {
              ...current,
              [field]: value,
              isDirty: true,
            },
          },
        };
      });
    },
    [setModuleState],
  );

  const toggleCellActive = useCallback(
    (moduleCode: ModuleCode, groupId: number, moduleRangeId: number) => {
      setModuleState(moduleCode, (prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current = prev.cells[key] ?? createEmptyCellDraft(groupId, moduleRangeId);

        return {
          ...prev,
          cells: {
            ...prev.cells,
            [key]: {
              ...current,
              active: !current.active,
              isDirty: true,
            },
          },
        };
      });
    },
    [setModuleState],
  );

  const saveCells = useCallback(
    async (moduleCode: ModuleCode) => {
      if (disabled) return false;

      const moduleState = getModuleState(moduleCode);

      const groups = sortGroups(
        moduleState.groups.filter((g) => !g.isDeleted && typeof g.id === "number"),
      );
      const ranges = sortRanges(
        moduleState.ranges.filter((r) => !r.isDeleted && typeof r.id === "number"),
      );

      if (groups.length === 0) {
        setError("请先保存区域范围");
        return false;
      }
      if (ranges.length === 0) {
        setError("请先保存重量段");
        return false;
      }

      const cellsPayload = [];
      for (const g of groups) {
        for (const r of ranges) {
          const key = buildCellKey(g.id as number, r.id as number);
          const draft = moduleState.cells[key] ?? createEmptyCellDraft(g.id as number, r.id as number);

          const err = validateMatrixCellDraft(draft);
          if (err) {
            setError(err);
            return false;
          }

          cellsPayload.push({
            group_id: g.id as number,
            module_range_id: r.id as number,
            pricing_mode: draft.pricingMode,
            flat_amount: draft.pricingMode === "flat" ? parseRequiredNumber(draft.flatAmount) : null,
            base_amount:
              draft.pricingMode === "linear_total" || draft.pricingMode === "step_over"
                ? parseRequiredNumber(draft.baseAmount)
                : null,
            rate_per_kg:
              draft.pricingMode === "linear_total" || draft.pricingMode === "step_over"
                ? parseRequiredNumber(draft.ratePerKg)
                : null,
            base_kg: draft.pricingMode === "step_over" ? parseRequiredNumber(draft.baseKg) : null,
            active: draft.active,
          });
        }
      }

      setModuleState(moduleCode, (prev) => ({
        ...prev,
        savingCells: true,
        error: null,
      }));
      setError(null);
      setSuccess(null);

      try {
        const resp = await putModuleMatrixCells(schemeId, moduleCode, {
          cells: cellsPayload,
        });

        const nextCells: Record<string, ReturnType<typeof mapCellApiToDraft>> = {};
        (resp.cells ?? []).forEach((row) => {
          const draft = mapCellApiToDraft(row);
          nextCells[draft.key] = draft;
        });

        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingCells: false,
          cells: nextCells,
        }));

        setSuccess(`${moduleCode === "standard" ? "标准区域" : "其他区域"}价格矩阵已保存。`);
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存价格矩阵失败";
        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingCells: false,
          error: msg,
        }));
        setError(msg);
        return false;
      }
    },
    [disabled, getModuleState, schemeId, setError, setModuleState, setSuccess],
  );

  return {
    updateCellMode,
    updateCellField,
    toggleCellActive,
    saveCells,
  };
}
