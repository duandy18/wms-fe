// src/features/tms/providers/scheme/workbench/state/surcharges/save.ts
//
// 分拆说明：
// - 从原 state/surcharges.ts 中拆出。
// - 当前只负责 surcharge 子域远程保存动作：
//   1) 省级编辑区整体保存
//   2) 城市容器卡单卡保存
// - 当前不负责：
//   1) 本地编辑态维护
//   2) 页面级状态装配
// - 维护约束：
//   - delete / batch create / patch 顺序真相收口在这里；不要把保存流程散回 UI 或 index.ts。

import { useCallback } from "react";
import {
  batchCreateProvinceSurchargeConfigs,
  createSurchargeConfig,
  deleteSurchargeConfig,
  patchSurchargeConfig,
} from "../../../../api/surcharges";
import type { PricingSchemeSurchargeConfig } from "../../../../api/types";
import type { SurchargeRuleRow } from "../../domain/types";
import { mapSurchargeConfigApiToRow } from "../mappers";
import type { ProvinceBatchDraft } from "./helpers";
import {
  normalizeCities,
  sortRows,
  trim,
  validateDuplicateProvinceWorkspace,
  validateProvinceDraft,
  validateRow,
} from "./helpers";

type Args = {
  schemeId: number;
  disabled: boolean;
  surcharges: SurchargeRuleRow[];
  provinceDrafts: ProvinceBatchDraft[];
  setSurcharges: React.Dispatch<React.SetStateAction<SurchargeRuleRow[]>>;
  setProvinceDrafts: React.Dispatch<React.SetStateAction<ProvinceBatchDraft[]>>;
  setSavingSurcharges: React.Dispatch<React.SetStateAction<boolean>>;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export type SurchargeSaveResult = {
  ok: boolean;
  error: string | null;
  success: string | null;
};

export function useSurchargeSaveActions(args: Args) {
  const {
    schemeId,
    disabled,
    surcharges,
    provinceDrafts,
    setSurcharges,
    setProvinceDrafts,
    setSavingSurcharges,
  } = args;

  const saveProvinceWorkspace = useCallback(async (): Promise<SurchargeSaveResult> => {
    if (disabled) {
      return { ok: false, error: null, success: null };
    }

    const provinceRows = surcharges.filter((x) => x.provinceMode === "province");
    const aliveProvinceRows = provinceRows.filter((x) => !x.isDeleted);

    const duplicateErr = validateDuplicateProvinceWorkspace([
      ...aliveProvinceRows.map((row) => ({
        provinceCode: trim(row.provinceCode),
        provinceName: trim(row.provinceName),
      })),
      ...provinceDrafts.map((item) => ({
        provinceCode: trim(item.provinceCode),
        provinceName: trim(item.provinceName),
      })),
    ]);
    if (duplicateErr) {
      return { ok: false, error: duplicateErr, success: null };
    }

    for (const row of aliveProvinceRows) {
      const err = validateRow(row);
      if (err) {
        return { ok: false, error: err, success: null };
      }
    }

    for (const item of provinceDrafts) {
      const err = validateProvinceDraft(item);
      if (err) {
        return { ok: false, error: err, success: null };
      }
    }

    const hasPendingChanges =
      provinceDrafts.length > 0 || provinceRows.some((row) => row.isDirty || row.isDeleted);

    if (!hasPendingChanges) {
      return { ok: true, error: null, success: "没有需要保存的更改" };
    }

    setSavingSurcharges(true);

    try {
      const deletedRows = provinceRows.filter((x) => x.isDeleted && typeof x.id === "number");

      for (const row of deletedRows) {
        await deleteSurchargeConfig(row.id as number);
      }

      let createdRows: SurchargeRuleRow[] = [];
      if (provinceDrafts.length > 0) {
        const result = await batchCreateProvinceSurchargeConfigs(schemeId, {
          items: provinceDrafts.map((item) => ({
            province_code: trim(item.provinceCode),
            province_name: trim(item.provinceName) || null,
            fixed_amount: Number(trim(item.fixedAmount)),
            active: Boolean(item.active),
          })),
        });

        createdRows = (result.created ?? []).map(mapSurchargeConfigApiToRow);
      }

      const updatedRows: SurchargeRuleRow[] = [];

      for (const row of aliveProvinceRows) {
        if (row.id == null || !row.isDirty) continue;

        const updated = await patchSurchargeConfig(row.id, {
          province_code: trim(row.provinceCode),
          province_name: trim(row.provinceName) || null,
          province_mode: "province",
          fixed_amount: Number(trim(row.fixedAmount)),
          active: row.active,
          cities: [],
        });
        updatedRows.push(mapSurchargeConfigApiToRow(updated));
      }

      const untouchedRows = aliveProvinceRows.filter(
        (row) => !(row.id != null && row.isDirty),
      );

      const cityRows = surcharges.filter((row) => row.provinceMode === "cities");
      const nextProvinceRows = sortRows([...untouchedRows, ...updatedRows, ...createdRows]);

      setSurcharges([...cityRows, ...nextProvinceRows]);
      setProvinceDrafts([]);

      return { ok: true, error: null, success: "省级附加费已保存。" };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存省级附加费失败";
      return { ok: false, error: msg, success: null };
    } finally {
      setSavingSurcharges(false);
    }
  }, [
    disabled,
    provinceDrafts,
    schemeId,
    setProvinceDrafts,
    setSavingSurcharges,
    setSurcharges,
    surcharges,
  ]);

  const saveCityRow = useCallback(
    async (clientId: string): Promise<SurchargeSaveResult> => {
      const target = surcharges.find(
        (row) => row.clientId === clientId && row.provinceMode === "cities" && !row.isDeleted,
      );
      if (!target || disabled) {
        return { ok: false, error: null, success: null };
      }

      const err = validateRow(target);
      if (err) {
        return { ok: false, error: err, success: null };
      }

      setSavingSurcharges(true);

      try {
        let saved: PricingSchemeSurchargeConfig;

        if (target.id == null) {
          saved = await createSurchargeConfig(schemeId, {
            province_code: trim(target.provinceCode),
            province_name: trim(target.provinceName) || null,
            province_mode: "cities",
            fixed_amount: 0,
            active: target.active,
            cities: normalizeCities(target.cities).map((city) => ({
              city_code: trim(city.cityCode),
              city_name: trim(city.cityName) || null,
              fixed_amount: Number(trim(city.fixedAmount)),
              active: city.active,
            })),
          });
        } else {
          saved = await patchSurchargeConfig(target.id, {
            province_code: trim(target.provinceCode),
            province_name: trim(target.provinceName) || null,
            province_mode: "cities",
            fixed_amount: 0,
            active: target.active,
            cities: normalizeCities(target.cities).map((city) => ({
              city_code: trim(city.cityCode),
              city_name: trim(city.cityName) || null,
              fixed_amount: Number(trim(city.fixedAmount)),
              active: city.active,
            })),
          });
        }

        const nextRow = mapSurchargeConfigApiToRow(saved);
        setSurcharges((prev) =>
          prev.map((row) => (row.clientId === clientId ? nextRow : row)),
        );

        return {
          ok: true,
          error: null,
          success: `${trim(target.provinceName) || trim(target.provinceCode)} 城市附加费已保存。`,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "保存城市附加费失败";
        return { ok: false, error: msg, success: null };
      } finally {
        setSavingSurcharges(false);
      }
    },
    [
      disabled,
      schemeId,
      setSavingSurcharges,
      setSurcharges,
      surcharges,
    ],
  );

  return {
    saveProvinceWorkspace,
    saveCityRow,
  };
}
