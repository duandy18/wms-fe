// src/features/tms/pricingTemplates/workbench/state/groups.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“区域范围 / 分组”子域动作：
//   1) 新增 / 删除组
//   2) 省份成员增删改
//   3) 整组成员集合覆盖（setGroupMembers）
//   4) 单行保存 groups（saveGroupRow）
// - 当前不负责：
//   1) ranges / matrix / surcharges 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 被 GroupsCard 的四列勾选网格调用 setGroupMembers
// - 维护约束：
//   - 省份集合的真相更新收口在这里；不要把这套逻辑散落回页面组件。
//   - 当前终态：区域范围按“逐行保存”处理，不再提供整卡统一保存。

import { useCallback } from "react";
import {
  createTemplateGroup,
  deleteTemplateGroup,
  fetchTemplateGroups,
  fetchTemplateMatrixCells,
  updateTemplateGroup,
} from "../api/modules";
import { newClientId, sortGroups } from "../domain/derived";
import type {
  GroupMemberRow,
  GroupRow,
  MatrixCellDraft,
  SaveFeedback,
} from "../domain/types";
import { mapCellApiToDraft, mapGroupApiToRow } from "./mappers";

type Args = {
  templateId: number;
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
    provinces: row.members
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

function normalizeMemberKey(member: GroupMemberRow): string {
  const code = member.provinceCode.trim();
  const name = member.provinceName.trim();
  return `${code}::${name}`;
}

function normalizeProvinceOwnershipKey(member: GroupMemberRow): string {
  const code = member.provinceCode.trim();
  if (code) return `code:${code}`;

  const name = member.provinceName.trim();
  if (name) return `name:${name}`;

  return "";
}

function isPersistedGroupRow(group: GroupRow): boolean {
  return !group.isDeleted && typeof group.id === "number" && !group.isNew;
}

function validateSingleGroupRow(row: GroupRow): string | null {
  const aliveMembers = row.members.filter(
    (member) => member.provinceCode.trim() || member.provinceName.trim(),
  );

  if (aliveMembers.length === 0) {
    return "当前区域行至少选择 1 个省份";
  }

  const seen = new Set<string>();
  for (const member of aliveMembers) {
    const key = normalizeMemberKey(member);
    if (seen.has(key)) {
      return "当前区域行存在重复省份";
    }
    seen.add(key);
  }

  return null;
}

function validateProvinceOwnership(
  targetClientId: string,
  groups: GroupRow[],
): string | null {
  const target = groups.find((group) => group.clientId === targetClientId && !group.isDeleted);
  if (!target) {
    return "未找到需要校验的区域行";
  }

  const persistedOwnerMap = new Map<string, string>();

  for (const group of groups.filter(isPersistedGroupRow)) {
    if (group.clientId === targetClientId) continue;

    for (const member of group.members) {
      const key = normalizeProvinceOwnershipKey(member);
      if (!key) continue;

      if (!persistedOwnerMap.has(key)) {
        persistedOwnerMap.set(key, group.clientId);
      }
    }
  }

  for (const member of target.members) {
    const key = normalizeProvinceOwnershipKey(member);
    if (!key) continue;

    if (persistedOwnerMap.has(key)) {
      return "当前区域行包含已被其他已保存区域行占用的省份";
    }
  }

  return null;
}

export function useGroupsActions(args: Args) {
  const {
    templateId,
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
        members: [],
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
        await deleteTemplateGroup(templateId, target.id);

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
    [disabled, groups, templateId, setCells, setGroups, setGroupsFeedback, setSavingGroups],
  );

  const addProvinceMember = useCallback(
    (clientId: string) => {
      setGroups((prev) =>
        prev.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                members: [...row.members, { provinceCode: "", provinceName: "" }],
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
    (clientId: string, memberIndex: number) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;
          if (row.members.length <= 1) return row;

          const nextMembers = [...row.members];
          nextMembers.splice(memberIndex, 1);

          return {
            ...row,
            members: nextMembers,
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
      memberIndex: number,
      provinceCode: string,
      provinceName: string,
    ) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;

          const nextMembers = [...row.members];
          const current = nextMembers[memberIndex];
          if (!current) return row;

          nextMembers[memberIndex] = {
            provinceCode,
            provinceName,
          };

          return {
            ...row,
            members: nextMembers,
            isDirty: true,
          };
        }),
      );
      clearFeedbackIfNeeded(setGroupsFeedback);
    },
    [setGroups, setGroupsFeedback],
  );

  const setGroupMembers = useCallback(
    (clientId: string, members: GroupMemberRow[]) => {
      setGroups((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;

          return {
            ...row,
            members: members.map((p) => ({
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

  const saveGroupRow = useCallback(
    async (clientId: string) => {
      if (disabled) return false;

      const aliveDesired = sortGroups(groups.filter((g) => !g.isDeleted));
      const targetIndex = aliveDesired.findIndex((row) => row.clientId === clientId);
      const target = targetIndex >= 0 ? aliveDesired[targetIndex] : null;

      if (!target) {
        setGroupsFeedback({
          error: "未找到需要保存的区域行",
          success: null,
        });
        return false;
      }

      const rowError = validateSingleGroupRow(target);
      if (rowError) {
        setGroupsFeedback({
          error: rowError,
          success: null,
        });
        return false;
      }

      const ownershipError = validateProvinceOwnership(clientId, aliveDesired);
      if (ownershipError) {
        setGroupsFeedback({
          error: ownershipError,
          success: null,
        });
        return false;
      }

      setSavingGroups(() => true);
      setGroupsFeedback({
        error: null,
        success: null,
      });

      try {
        const payload = buildGroupWritePayload(target, targetIndex);

        if (typeof target.id === "number") {
          await updateTemplateGroup(templateId, target.id, payload);
        } else {
          await createTemplateGroup(templateId, payload);
        }

        const groupsResp = await fetchTemplateGroups(templateId);
        const cellsResp = await fetchTemplateMatrixCells(templateId);

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
          success: `第 ${targetIndex + 1} 行区域范围已保存；若省份范围发生变化，请检查对应矩阵。`,
        });
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存区域行失败";
        setGroupsFeedback({
          error: msg,
          success: null,
        });
        return false;
      } finally {
        setSavingGroups(() => false);
      }
    },
    [disabled, groups, templateId, setCells, setGroups, setGroupsFeedback, setSavingGroups],
  );

  return {
    addGroup,
    removeGroup,
    addProvinceMember,
    removeProvinceMember,
    updateProvinceMember,
    setGroupMembers,
    saveGroupRow,
  };
}
