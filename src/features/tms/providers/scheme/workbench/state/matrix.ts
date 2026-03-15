// src/features/tms/providers/scheme/workbench/state/matrix.ts
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
import { putSchemeMatrixCells } from "../api/modules";
import {
  buildCellKey,
  createEmptyCellDraft,
  normalizeCellDraftMode,
  parseRequiredNumber,
  sortGroups,
  sortRanges,
  validateMatrixCellDraft,
} from "../domain/derived";
import type {
  GroupRow,
  MatrixCellDraft,
  PricingMode,
  RangeRow,
  SaveFeedback,
} from "../domain/types";
import { mapCellApiToDraft } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  ranges: RangeRow[];
  groups: GroupRow[];
  cells: Record<string, MatrixCellDraft>;
  setCells: (updater: (prev: Record<string, MatrixCellDraft>) => Record<string, MatrixCellDraft>) => void;
  setSavingCells: (updater: (prev: boolean) => boolean) => void;
  setMatrixFeedback: React.Dispatch<React.SetStateAction<SaveFeedback>>;
};

function resolveRangePricingMode(ranges: RangeRow[], moduleRangeId: number): PricingMode {
  const row = ranges.find((r) => r.id === moduleRangeId && !r.isDeleted);
  return row?.defaultPricingMode ?? "flat";
}

function clearFeedbackIfNeeded(
  setMatrixFeedback: React.Dispatch<React.SetStateAction<SaveFeedback>>,
) {
  setMatrixFeedback((prev) =>
    prev.error || prev.success ? { error: null, success: null } : prev,
  );
}

export function useMatrixActions(args: Args) {
  const {
    schemeId,
    disabled,
    ranges,
    groups,
    cells,
    setCells,
    setSavingCells,
    setMatrixFeedback,
  } = args;

  const updateCellMode = useCallback(
    (groupId: number, moduleRangeId: number, mode: PricingMode) => {
      setCells((prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current =
          prev[key] ??
          createEmptyCellDraft(
            groupId,
            moduleRangeId,
            resolveRangePricingMode(ranges, moduleRangeId),
          );

        return {
          ...prev,
          [key]: {
            ...normalizeCellDraftMode(current, mode),
            isDirty: true,
          },
        };
      });
      clearFeedbackIfNeeded(setMatrixFeedback);
    },
    [ranges, setCells, setMatrixFeedback],
  );

  const updateCellField = useCallback(
    (
      groupId: number,
      moduleRangeId: number,
      field: "flatAmount" | "baseAmount" | "ratePerKg" | "baseKg",
      value: string,
    ) => {
      setCells((prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current =
          prev[key] ??
          createEmptyCellDraft(
            groupId,
            moduleRangeId,
            resolveRangePricingMode(ranges, moduleRangeId),
          );

        return {
          ...prev,
          [key]: {
            ...current,
            [field]: value,
            isDirty: true,
          },
        };
      });
      clearFeedbackIfNeeded(setMatrixFeedback);
    },
    [ranges, setCells, setMatrixFeedback],
  );

  const toggleCellActive = useCallback(
    (groupId: number, moduleRangeId: number) => {
      setCells((prev) => {
        const key = buildCellKey(groupId, moduleRangeId);
        const current =
          prev[key] ??
          createEmptyCellDraft(
            groupId,
            moduleRangeId,
            resolveRangePricingMode(ranges, moduleRangeId),
          );

        return {
          ...prev,
          [key]: {
            ...current,
            active: !current.active,
            isDirty: true,
          },
        };
      });
      clearFeedbackIfNeeded(setMatrixFeedback);
    },
    [ranges, setCells, setMatrixFeedback],
  );

  const saveCells = useCallback(async () => {
    if (disabled) return false;

    const aliveGroups = sortGroups(groups.filter((g) => !g.isDeleted && typeof g.id === "number"));
    const aliveRanges = sortRanges(ranges.filter((r) => !r.isDeleted && typeof r.id === "number"));

    if (aliveGroups.length === 0) {
      setMatrixFeedback({
        error: "请先保存区域范围",
        success: null,
      });
      return false;
    }
    if (aliveRanges.length === 0) {
      setMatrixFeedback({
        error: "请先保存重量段",
        success: null,
      });
      return false;
    }

    const cellsPayload = [];
    for (const g of aliveGroups) {
      for (const r of aliveRanges) {
        const key = buildCellKey(g.id as number, r.id as number);
        const draft =
          cells[key] ??
          createEmptyCellDraft(
            g.id as number,
            r.id as number,
            r.defaultPricingMode,
          );

        const err = validateMatrixCellDraft(draft);
        if (err) {
          setMatrixFeedback({
            error: err,
            success: null,
          });
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

    setSavingCells(() => true);
    setMatrixFeedback({
      error: null,
      success: null,
    });

    try {
      const resp = await putSchemeMatrixCells(schemeId, {
        cells: cellsPayload,
      });

      const nextCells: Record<string, ReturnType<typeof mapCellApiToDraft>> = {};
      (resp.cells ?? []).forEach((row) => {
        const draft = mapCellApiToDraft(row);
        nextCells[draft.key] = draft;
      });

      setCells(() => nextCells);

      setMatrixFeedback({
        error: null,
        success: "价格矩阵已保存。",
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存价格矩阵失败";
      setMatrixFeedback({
        error: msg,
        success: null,
      });
      return false;
    } finally {
      setSavingCells(() => false);
    }
  }, [cells, disabled, groups, ranges, schemeId, setCells, setMatrixFeedback, setSavingCells]);

  return {
    updateCellMode,
    updateCellField,
    toggleCellActive,
    saveCells,
  };
}
