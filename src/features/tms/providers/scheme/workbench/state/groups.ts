// src/features/tms/providers/scheme/workbench/state/groups.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“区域范围 / 分组”子域动作：
//   1) 新增 / 删除组
//   2) 省份成员增删改
//   3) 整组省份集合覆盖（setGroupProvinces）
//   4) 整体保存 groups
// - 当前不负责：
//   1) ranges / matrix / surcharges 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 被 GroupsCard 的四列勾选网格调用 setGroupProvinces
// - 维护约束：
//   - 省份集合的真相更新收口在这里；不要把这套逻辑散落回页面组件。

import { useCallback } from "react";
import {
  createSchemeGroup,
  deleteSchemeGroup,
  fetchSchemeGroups,
  fetchSchemeMatrixCells,
} from "../api/modules";
import { newClientId, sortGroups, validateGroupRows } from "../domain/derived";
import type {
  GroupProvinceRow,
  GroupRow,
  MatrixCellDraft,
  SaveFeedback,
} from "../domain/types";
import { mapCellApiToDraft, mapGroupApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  groups: GroupRow[];
  setGroups: (updater: (prev: GroupRow[]) => GroupRow[]) => void;
  setCells: (updater: (prev: Record<string, MatrixCellDraft>) => Record<string, MatrixCellDraft>) => void;
  setSavingGroups: (updater: (prev: boolean) => boolean) => void;
  setGroupsFeedback: React.Dispatch<React.SetStateAction<SaveFeedback>>;
};

function stripGroupCells(
  cells: Record<string, MatrixCellDraft>,
  groupId: number | undefined,
): Record<string, MatrixCellDraft> {
  if (!groupId) return cells;

  return Object.fromEntries(
    Object.entries(cells).filter(([, cell]) => cell.groupId !== groupId),
  );
}

function buildGroupWritePayload(row: GroupRow, sortOrder: number) {
  return {
    sort_order: sortOrder,
    active: row.active,
    provinces: row.provinces
      .map((p) => ({
        province_code: p.provinceCode.trim() || null,
        province_name: p.provinceName.trim() || null,
      }))
      .filter((p) => p.province_code || p.province_name),
  };
}

function clearFeedbackIfNeeded(
  setGroupsFeedback: React.Dispatch<React.SetStateAction<SaveFeedback>>,
) {
  setGroupsFeedback((prev) =>
    prev.error || prev.success ? { error: null, success: null } : prev,
  );
}

export function useGroupsActions(args: Args) {
  const {
    schemeId,
    disabled,
    groups,
    setGroups,
    setCells,
    setSavingGroups,
    setGroupsFeedback,
  } = args;

  const addGroup = useCallback(() => {
    const clientId = newClientId("group");

    setGroups((prev) => {
      const alive = prev.filter((g) => !g.isDeleted);

      const next: GroupRow = {
        id: undefined,
        clientId,
        name: "",
        provinces: [],
        sortOrder: alive.length,
        active: true,
        isNew: true,
        isDirty: true,
        isDeleted: false,
      };

      return sortGroups([...prev, next]);
    });

    clearFeedbackIfNeeded(setGroupsFeedback);
    return clientId;
  }, [setGroups, setGroupsFeedback]);

  const removeGroup = useCallback(
    async (clientId: string) => {
      if (disabled) return false;

      const alive = groups.filter((g) => !g.isDeleted);
      if (alive.length <= 1) {
        setGroupsFeedback({
          error: "至少保留一行区域范围",
          success: null,
        });
        return false;
      }

      const target = groups.find((g) => g.clientId === clientId && !g.isDeleted);
      if (!target) return false;

      setGroupsFeedback({
        error: null,
        success: null,
      });

      if (!target.id) {
        setGroups((prev) => prev.filter((row) => row.clientId !== clientId));
        setGroupsFeedback({
          error: null,
          success: "未保存的区域行已删除",
        });
        return true;
      }

      setSavingGroups(() => true);

      try {
        await deleteSchemeGroup(schemeId, target.id);

        setGroups((prev) => prev.filter((row) => row.clientId !== clientId));
        setCells((prev) => stripGroupCells(prev, target.id));

        setGroupsFeedback({
          error: null,
          success: "区域行已删除；该行对应矩阵已移除。",
        });
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "删除区域行失败";
        setGroupsFeedback({
          error: msg,
          success: null,
        });
        return false;
      } finally {
        setSavingGroups(() => false);
      }
    },
    [disabled, groups, schemeId, setCells, setGroups, setGroupsFeedback, setSavingGroups],
  );

  const addProvinceMember = useCallback(
    (clientId: string) => {
      setGroups((prev) =>
        prev.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                provinces: [...row.provinces, { provinceCode: "", provinceName: "" }],
                isDirty: true,
              }
            : row,
        ),
      );
      clearFeedbackIfNeeded(setGroupsFeedback);
    },
    [setGroups, setGroupsFeedback],
  );

  const removeProvinceMember = useCallback(
    (clientId: string, provinceIndex: number) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;
          if (row.provinces.length <= 1) return row;

          const nextProvinces = [...row.provinces];
          nextProvinces.splice(provinceIndex, 1);

          return {
            ...row,
            provinces: nextProvinces,
            isDirty: true,
          };
        }),
      );
      clearFeedbackIfNeeded(setGroupsFeedback);
    },
    [setGroups, setGroupsFeedback],
  );

  const updateProvinceMember = useCallback(
    (
      clientId: string,
      provinceIndex: number,
      provinceCode: string,
      provinceName: string,
    ) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;

          const nextProvinces = [...row.provinces];
          const current = nextProvinces[provinceIndex];
          if (!current) return row;

          nextProvinces[provinceIndex] = {
            provinceCode,
            provinceName,
          };

          return {
            ...row,
            provinces: nextProvinces,
            isDirty: true,
          };
        }),
      );
      clearFeedbackIfNeeded(setGroupsFeedback);
    },
    [setGroups, setGroupsFeedback],
  );

  const setGroupProvinces = useCallback(
    (clientId: string, provinces: GroupProvinceRow[]) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;

          return {
            ...row,
            provinces: provinces.map((p) => ({
              provinceCode: p.provinceCode,
              provinceName: p.provinceName,
            })),
            isDirty: true,
          };
        }),
      );
      clearFeedbackIfNeeded(setGroupsFeedback);
    },
    [setGroups, setGroupsFeedback],
  );

  const saveGroups = useCallback(async () => {
    if (disabled) return false;

    const validateErrors = validateGroupRows(groups);
    if (validateErrors.length > 0) {
      setGroupsFeedback({
        error: validateErrors[0],
        success: null,
      });
      return false;
    }

    const aliveDesired = sortGroups(groups.filter((g) => !g.isDeleted));

    const hasPendingChanges =
      groups.some((g) => g.isNew || g.isDirty || g.isDeleted) ||
      aliveDesired.some((g, idx) => g.sortOrder !== idx);

    if (!hasPendingChanges) {
      setGroupsFeedback({
        error: null,
        success: "没有需要保存的更改",
      });
      return true;
    }

    setSavingGroups(() => true);
    setGroupsFeedback({
      error: null,
      success: null,
    });

    try {
      const recreateClientIds = new Set<string>();

      aliveDesired.forEach((row, idx) => {
        const sortOrderChanged = row.sortOrder !== idx;
        if (row.isNew || row.id == null || row.isDirty || sortOrderChanged) {
          recreateClientIds.add(row.clientId);
        }
      });

      const deleteIds = new Set<number>();

      groups.forEach((row) => {
        if (row.isDeleted && typeof row.id === "number") {
          deleteIds.add(row.id);
        }
      });

      aliveDesired.forEach((row) => {
        if (recreateClientIds.has(row.clientId) && typeof row.id === "number") {
          deleteIds.add(row.id);
        }
      });

      for (const groupId of deleteIds) {
        await deleteSchemeGroup(schemeId, groupId);
      }

      for (const [idx, row] of aliveDesired.entries()) {
        if (!recreateClientIds.has(row.clientId)) {
          continue;
        }

        await createSchemeGroup(schemeId, buildGroupWritePayload(row, idx));
      }

      const groupsResp = await fetchSchemeGroups(schemeId);
      const cellsResp = await fetchSchemeMatrixCells(schemeId);

      const nextGroups = sortGroups((groupsResp.groups ?? []).map(mapGroupApiToRow));
      const nextCells: Record<string, MatrixCellDraft> = {};
      (cellsResp.cells ?? []).forEach((row) => {
        const draft = mapCellApiToDraft(row);
        nextCells[draft.key] = draft;
      });

      setGroups(() => nextGroups);
      setCells(() => nextCells);

      setGroupsFeedback({
        error: null,
        success: "区域范围已整体保存；发生变化的区域行对应矩阵需重新补录。",
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存区域范围失败";
      setGroupsFeedback({
        error: msg,
        success: null,
      });
      return false;
    } finally {
      setSavingGroups(() => false);
    }
  }, [disabled, groups, schemeId, setCells, setGroups, setGroupsFeedback, setSavingGroups]);

  return {
    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupProvinces,
    saveGroups,
  };
}
