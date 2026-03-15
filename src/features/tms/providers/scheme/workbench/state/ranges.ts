// src/features/tms/providers/scheme/workbench/state/ranges.ts
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
import { fetchSchemeMatrixCells, putSchemeRanges } from "../api/modules";
import {
  newClientId,
  sortRanges,
  validateRangeRows,
} from "../domain/derived";
import type {
  MatrixCellDraft,
  PricingMode,
  RangeRow,
  SaveFeedback,
} from "../domain/types";
import { mapCellApiToDraft, mapRangeApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  ranges: RangeRow[];
  setRanges: (updater: (prev: RangeRow[]) => RangeRow[]) => void;
  setCells: (updater: (prev: Record<string, MatrixCellDraft>) => Record<string, MatrixCellDraft>) => void;
  setSavingRanges: (updater: (prev: boolean) => boolean) => void;
  setRangesFeedback: React.Dispatch<React.SetStateAction<SaveFeedback>>;
};

function nextDefaultPricingMode(rows: RangeRow[]): PricingMode {
  const alive = sortRanges(rows.filter((r) => !r.isDeleted));
  return alive.slice(-1)[0]?.defaultPricingMode ?? "flat";
}

export function useRangesActions(args: Args) {
  const {
    schemeId,
    disabled,
    ranges,
    setRanges,
    setCells,
    setSavingRanges,
    setRangesFeedback,
  } = args;

  const addRange = useCallback(() => {
    setRanges((prev) => {
      const alive = prev.filter((r) => !r.isDeleted);
      const last = sortRanges(alive).slice(-1)[0] ?? null;
      const nextMin = last ? (last.maxKg.trim() || last.minKg.trim() || "0") : "0";

      const next: RangeRow = {
        id: undefined,
        clientId: newClientId("range"),
        minKg: nextMin,
        maxKg: "",
        defaultPricingMode: nextDefaultPricingMode(prev),
        sortOrder: alive.length,
        isNew: true,
        isDirty: true,
        isDeleted: false,
      };

      return sortRanges([...prev, next]);
    });
  }, [setRanges]);

  const updateRangeField = useCallback(
    (clientId: string, field: "minKg" | "maxKg" | "defaultPricingMode", value: string) => {
      setRanges((prev) =>
        prev.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                [field]: value,
                isDirty: true,
              }
            : row,
        ),
      );
      setRangesFeedback((prev) =>
        prev.error || prev.success ? { error: null, success: null } : prev,
      );
    },
    [setRanges, setRangesFeedback],
  );

  const removeRange = useCallback(
    (clientId: string) => {
      setRanges((prev) => {
        const alive = prev.filter((r) => !r.isDeleted);
        if (alive.length <= 1) return prev;

        return prev.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                isDeleted: true,
                isDirty: true,
              }
            : row,
        );
      });
      setRangesFeedback((prev) =>
        prev.error || prev.success ? { error: null, success: null } : prev,
      );
    },
    [setRanges, setRangesFeedback],
  );

  const saveRanges = useCallback(async () => {
    if (disabled) return false;

    const errors = validateRangeRows(ranges);
    if (errors.length > 0) {
      setRangesFeedback({
        error: errors[0],
        success: null,
      });
      return false;
    }

    const hasPendingChanges = ranges.some((row) => row.isNew || row.isDirty || row.isDeleted);
    if (!hasPendingChanges) {
      setRangesFeedback({
        error: null,
        success: "没有需要保存的更改",
      });
      return true;
    }

    setSavingRanges(() => true);
    setRangesFeedback({
      error: null,
      success: null,
    });

    try {
      const alive = sortRanges(ranges.filter((r) => !r.isDeleted));
      const payload = {
        ranges: alive.map((row, idx) => ({
          min_kg: Number(row.minKg.trim()),
          max_kg: row.maxKg.trim() ? Number(row.maxKg.trim()) : null,
          default_pricing_mode: row.defaultPricingMode,
          sort_order: idx,
        })),
      };

      const resp = await putSchemeRanges(schemeId, payload);

      setRanges(() => sortRanges((resp.ranges ?? []).map(mapRangeApiToRow)));

      const cellsResp = await fetchSchemeMatrixCells(schemeId);
      const nextCells: Record<string, MatrixCellDraft> = {};
      (cellsResp.cells ?? []).forEach((cellRow) => {
        const draft = mapCellApiToDraft(cellRow);
        nextCells[draft.key] = draft;
      });
      setCells(() => nextCells);

      setRangesFeedback({
        error: null,
        success: "重量段已保存；价格矩阵已按最新保存结果刷新。",
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存重量段失败";
      setRangesFeedback({
        error: msg,
        success: null,
      });
      return false;
    } finally {
      setSavingRanges(() => false);
    }
  }, [disabled, ranges, schemeId, setCells, setRanges, setRangesFeedback, setSavingRanges]);

  return {
    addRange,
    updateRangeField,
    removeRange,
    saveRanges,
  };
}
