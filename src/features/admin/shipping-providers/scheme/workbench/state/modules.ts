// src/features/admin/shipping-providers/scheme/workbench/state/modules.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“单 scheme 资源数据加载”动作：loadAll。
// - 历史上这里叫 modules.ts，但当前语义已不再是“双模块加载”。
// - 当前不负责：
//   1) 页面级状态装配
//   2) ranges / groups / matrix / surcharges 的编辑动作
// - 协作关系：
//   - 依赖 ./mappers 完成 DTO -> 行状态转换
//   - 被 ../usePricingWorkbench 装配使用
// - 维护约束：
//   - 本文件只处理加载；不要继续吸收保存和局部编辑逻辑。

import { useCallback } from "react";
import {
  fetchSchemeGroups,
  fetchSchemeMatrixCells,
  fetchSchemeRanges,
} from "../api/modules";
import type { MatrixCellDraft, GroupRow, RangeRow } from "../domain/types";
import { sortGroups, sortRanges } from "../domain/derived";
import { mapCellApiToDraft, mapGroupApiToRow, mapRangeApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  setLoading: (updater: (prev: boolean) => boolean) => void;
  setRanges: (updater: (prev: RangeRow[]) => RangeRow[]) => void;
  setGroups: (updater: (prev: GroupRow[]) => GroupRow[]) => void;
  setCells: (updater: (prev: Record<string, MatrixCellDraft>) => Record<string, MatrixCellDraft>) => void;
  setLoadError: (msg: string | null) => void;
};

export function useModuleLoadActions(args: Args) {
  const { schemeId, setLoading, setRanges, setGroups, setCells, setLoadError } = args;

  const loadAll = useCallback(async () => {
    setLoading(() => true);
    setLoadError(null);

    try {
      const [rangesResp, groupsResp, cellsResp] = await Promise.all([
        fetchSchemeRanges(schemeId),
        fetchSchemeGroups(schemeId),
        fetchSchemeMatrixCells(schemeId),
      ]);

      const nextRanges = sortRanges((rangesResp.ranges ?? []).map(mapRangeApiToRow));
      const nextGroups = sortGroups((groupsResp.groups ?? []).map(mapGroupApiToRow));

      const nextCells: Record<string, MatrixCellDraft> = {};
      (cellsResp.cells ?? []).forEach((row) => {
        const draft = mapCellApiToDraft(row);
        nextCells[draft.key] = draft;
      });

      setRanges(() => nextRanges);
      setGroups(() => nextGroups);
      setCells(() => nextCells);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "加载运价工作台失败";
      setLoadError(msg);
    } finally {
      setLoading(() => false);
    }
  }, [schemeId, setCells, setGroups, setLoadError, setLoading, setRanges]);

  return {
    loadAll,
  };
}
