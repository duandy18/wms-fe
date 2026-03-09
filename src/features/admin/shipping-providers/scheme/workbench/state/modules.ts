// src/features/admin/shipping-providers/scheme/workbench/state/modules.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“模块数据加载”动作：loadModule / loadAll。
// - 当前不负责：
//   1) 页面级状态装配
//   2) ranges / groups / matrix / surcharges 的编辑动作
// - 协作关系：
//   - 依赖 ./mappers 完成 DTO -> 行状态转换
//   - 被 ../usePricingWorkbench 装配使用
// - 维护约束：
//   - 本文件只处理模块加载；不要继续吸收保存和局部编辑逻辑。

import { useCallback } from "react";
import {
  fetchModuleGroups,
  fetchModuleMatrixCells,
  fetchModuleRanges,
} from "../api/modules";
import type { ModuleCode } from "../api/types";
import type { MatrixCellDraft, ModuleEditorState } from "../domain/types";
import { sortGroups, sortRanges } from "../domain/derived";
import { mapCellApiToDraft, mapGroupApiToRow, mapRangeApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  setModuleState: (moduleCode: ModuleCode, updater: (prev: ModuleEditorState) => ModuleEditorState) => void;
  setError: (msg: string | null) => void;
};

export function useModuleLoadActions(args: Args) {
  const { schemeId, setModuleState, setError } = args;

  const loadModule = useCallback(
    async (moduleCode: ModuleCode) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const [rangesResp, groupsResp, cellsResp] = await Promise.all([
          fetchModuleRanges(schemeId, moduleCode),
          fetchModuleGroups(schemeId, moduleCode),
          fetchModuleMatrixCells(schemeId, moduleCode),
        ]);

        const nextRanges = sortRanges((rangesResp.ranges ?? []).map(mapRangeApiToRow));
        const nextGroups = sortGroups((groupsResp.groups ?? []).map(mapGroupApiToRow));

        const nextCells: Record<string, MatrixCellDraft> = {};
        (cellsResp.cells ?? []).forEach((row) => {
          const draft = mapCellApiToDraft(row);
          nextCells[draft.key] = draft;
        });

        setModuleState(moduleCode, (prev) => ({
          ...prev,
          loading: false,
          error: null,
          ranges: nextRanges,
          groups: nextGroups,
          cells: nextCells,
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "加载模块失败";
        setModuleState(moduleCode, (prev) => ({
          ...prev,
          loading: false,
          error: msg,
        }));
        setError(msg);
      }
    },
    [schemeId, setError, setModuleState],
  );

  const loadAll = useCallback(async () => {
    await Promise.all([loadModule("standard"), loadModule("other")]);
  }, [loadModule]);

  return {
    loadModule,
    loadAll,
  };
}
