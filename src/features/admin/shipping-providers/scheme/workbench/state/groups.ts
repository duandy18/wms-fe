// src/features/admin/shipping-providers/scheme/workbench/state/groups.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“区域范围 / 分组”子域动作：
//   1) 新增 / 删除组
//   2) 省份成员增删改
//   3) 整组省份集合覆盖（setGroupProvinces）
//   4) 保存 groups
// - 当前不负责：
//   1) ranges / matrix / surcharges 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 被 GroupsCard 的四列勾选网格调用 setGroupProvinces
// - 维护约束：
//   - 省份集合的真相更新收口在这里；不要把这套逻辑散落回页面组件。

import { useCallback } from "react";
import { putModuleGroups } from "../api/modules";
import type { ModuleCode } from "../api/types";
import {
  buildGroupInternalName,
  newClientId,
  sortGroups,
  validateGroupRows,
} from "../domain/derived";
import type {
  GroupProvinceRow,
  GroupRow,
  ModuleEditorState,
} from "../domain/types";
import { mapGroupApiToRow } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  getModuleState: (moduleCode: ModuleCode) => ModuleEditorState;
  setModuleState: (moduleCode: ModuleCode, updater: (prev: ModuleEditorState) => ModuleEditorState) => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export function useGroupsActions(args: Args) {
  const { schemeId, disabled, getModuleState, setModuleState, setError, setSuccess } = args;

  const addGroup = useCallback(
    (moduleCode: ModuleCode) => {
      setModuleState(moduleCode, (prev) => {
        const alive = prev.groups.filter((g) => !g.isDeleted);

        const next: GroupRow = {
          id: undefined,
          clientId: newClientId(`group:${moduleCode}`),
          name: "",
          provinces: [],
          sortOrder: alive.length,
          active: true,
          isNew: true,
          isDirty: true,
          isDeleted: false,
        };

        return {
          ...prev,
          groups: sortGroups([...prev.groups, next]),
        };
      });
    },
    [setModuleState],
  );

  const removeGroup = useCallback(
    (moduleCode: ModuleCode, clientId: string) => {
      setModuleState(moduleCode, (prev) => {
        const alive = prev.groups.filter((g) => !g.isDeleted);
        if (alive.length <= 1) return prev;

        return {
          ...prev,
          groups: prev.groups.map((row) =>
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

  const addProvinceMember = useCallback(
    (moduleCode: ModuleCode, clientId: string) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        groups: prev.groups.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                provinces: [...row.provinces, { provinceCode: "", provinceName: "" }],
                isDirty: true,
              }
            : row,
        ),
      }));
    },
    [setModuleState],
  );

  const removeProvinceMember = useCallback(
    (moduleCode: ModuleCode, clientId: string, provinceIndex: number) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        groups: prev.groups.map((row) => {
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
      }));
    },
    [setModuleState],
  );

  const updateProvinceMember = useCallback(
    (
      moduleCode: ModuleCode,
      clientId: string,
      provinceIndex: number,
      provinceCode: string,
      provinceName: string,
    ) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        groups: prev.groups.map((row) => {
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
      }));
    },
    [setModuleState],
  );

  const setGroupProvinces = useCallback(
    (moduleCode: ModuleCode, clientId: string, provinces: GroupProvinceRow[]) => {
      setModuleState(moduleCode, (prev) => ({
        ...prev,
        groups: prev.groups.map((row) => {
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
      }));
    },
    [setModuleState],
  );

  const saveGroups = useCallback(
    async (moduleCode: ModuleCode) => {
      if (disabled) return false;

      const moduleState = getModuleState(moduleCode);
      const errors = validateGroupRows(moduleState.groups);
      if (errors.length > 0) {
        setError(errors[0]);
        return false;
      }

      setModuleState(moduleCode, (prev) => ({
        ...prev,
        savingGroups: true,
        error: null,
      }));
      setError(null);
      setSuccess(null);

      try {
        const alive = sortGroups(moduleState.groups.filter((g) => !g.isDeleted));
        const payload = {
          groups: alive.map((row, idx) => ({
            name: buildGroupInternalName(row.provinces, idx),
            sort_order: idx,
            active: row.active,
            provinces: row.provinces
              .map((p) => ({
                province_code: p.provinceCode.trim() || null,
                province_name: p.provinceName.trim() || null,
              }))
              .filter((p) => p.province_code || p.province_name),
          })),
        };

        const resp = await putModuleGroups(schemeId, moduleCode, payload);

        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingGroups: false,
          groups: sortGroups((resp.groups ?? []).map(mapGroupApiToRow)),
          cells: {},
        }));

        setSuccess(
          `${moduleCode === "standard" ? "标准区域" : "其他区域"}区域范围已保存；该模块矩阵已清空，需要重新录入后保存。`,
        );
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存区域范围失败";
        setModuleState(moduleCode, (prev) => ({
          ...prev,
          savingGroups: false,
          error: msg,
        }));
        setError(msg);
        return false;
      }
    },
    [disabled, getModuleState, schemeId, setError, setModuleState, setSuccess],
  );

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
