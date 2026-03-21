// src/features/tms/pricingTemplates/workbench/state/surcharges/index.ts
//
// 分拆说明：
// - 由原 state/surcharges.ts 演进为 surcharge 子目录入口。
// - 当前只负责 surcharge 子域装配：
//   1) 省级草稿状态
//   2) 本地编辑动作
//   3) 装配保存动作
// - 当前不负责：
//   1) 纯函数校验（见 ./helpers.ts）
//   2) 远程保存流程（见 ./save.ts）
// - 维护约束：
//   - index.ts 保持子域入口定位，不再回涨成保存与校验杂货铺。

import { useCallback, useEffect, useState } from "react";
import {
  createPricingTemplateSurchargeCityContainer,
  deletePricingTemplateSurchargeConfig,
} from "../../../api";
import type {
  SurchargeConfigCityRow,
  SurchargeRuleRow,
} from "../../domain/types";
import {
  createEmptySurchargeCityRow,
  mapSurchargeConfigApiToRow,
} from "../mappers";
import { sortRows, trim, type ProvinceBatchDraft, type ProvinceSelection } from "./helpers";
import { useSurchargeSaveActions } from "./save";

type Args = {
  templateId: number;
  disabled: boolean;
  surcharges: SurchargeRuleRow[];
  setSurcharges: React.Dispatch<React.SetStateAction<SurchargeRuleRow[]>>;
  setSavingSurcharges: React.Dispatch<React.SetStateAction<boolean>>;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export function useSurchargeActions(args: Args) {
  const {
    templateId,
    disabled,
    surcharges,
    setSurcharges,
    setSavingSurcharges,
    setError,
    setSuccess,
  } = args;

  const [provinceDrafts, setProvinceDrafts] = useState<ProvinceBatchDraft[]>([]);

  useEffect(() => {
    setProvinceDrafts([]);
  }, [templateId]);

  const addProvinceDraft = useCallback((item: ProvinceSelection) => {
    const provinceCode = trim(item.provinceCode);
    const provinceName = trim(item.provinceName);

    if (!provinceCode) return;

    setProvinceDrafts((prev) => {
      if (prev.some((x) => x.provinceCode === provinceCode)) return prev;
      return [
        ...prev,
        {
          provinceCode,
          provinceName,
          fixedAmount: "",
          active: true,
        },
      ];
    });
  }, []);

  const updateProvinceDraft = useCallback(
    (
      provinceCode: string,
      patch: Partial<Pick<ProvinceBatchDraft, "fixedAmount" | "active">>,
    ) => {
      setProvinceDrafts((prev) =>
        prev.map((item) =>
          item.provinceCode === provinceCode
            ? {
                ...item,
                ...patch,
              }
            : item,
        ),
      );
    },
    [],
  );

  const removeProvinceDraft = useCallback((provinceCode: string) => {
    setProvinceDrafts((prev) => prev.filter((x) => x.provinceCode !== provinceCode));
  }, []);

  const clearProvinceDrafts = useCallback(() => {
    setProvinceDrafts([]);
  }, []);

  const createCitySurchargeGroup = useCallback(
    async (item: ProvinceSelection) => {
      if (disabled) return false;

      const provinceCode = trim(item.provinceCode);
      const provinceName = trim(item.provinceName);

      if (!provinceCode) {
        setError("请先选择省份。");
        return false;
      }

      setSavingSurcharges(true);
      setError(null);
      setSuccess(null);

      try {
        const created = await createPricingTemplateSurchargeCityContainer(templateId, {
          province_code: provinceCode,
          province_name: provinceName || null,
          active: true,
        });

        const nextRow = mapSurchargeConfigApiToRow(created);
        setSurcharges((prev) => sortRows([...prev, nextRow]));
        setSuccess(`已新增 ${provinceName || provinceCode} 的城市附加费配置。`);
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "新增城市附加费配置失败";
        setError(msg);
        return false;
      } finally {
        setSavingSurcharges(false);
      }
    },
    [disabled, templateId, setError, setSavingSurcharges, setSuccess, setSurcharges],
  );

  const updateSurchargeRow = useCallback(
    (
      clientId: string,
      patch: Partial<
        Pick<
          SurchargeRuleRow,
          "provinceCode" | "provinceName" | "provinceMode" | "fixedAmount" | "active" | "cities"
        >
      >,
    ) => {
      setSurcharges((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;

          const next: SurchargeRuleRow = {
            ...row,
            ...patch,
            isDirty: true,
          };

          if (next.provinceMode === "province") {
            next.cities = [];
          } else {
            next.fixedAmount = trim(next.fixedAmount) || "0";
          }

          return next;
        }),
      );
    },
    [setSurcharges],
  );

  const removeSurchargeRow = useCallback(
    (clientId: string) => {
      const target = surcharges.find((row) => row.clientId === clientId);
      if (!target) return;

      if (target.provinceMode === "province") {
        setSurcharges((prev) =>
          prev.map((row) =>
            row.clientId === clientId
              ? {
                  ...row,
                  isDeleted: true,
                  isDirty: true,
                }
              : row,
          ),
        );
        return;
      }

      if (target.id == null) {
        setSurcharges((prev) => prev.filter((row) => row.clientId !== clientId));
        return;
      }

      void (async () => {
        setSavingSurcharges(true);
        setError(null);
        setSuccess(null);

        try {
          await deletePricingTemplateSurchargeConfig(target.id as number);
          setSurcharges((prev) => prev.filter((row) => row.clientId !== clientId));
          setSuccess(`${trim(target.provinceName) || trim(target.provinceCode)} 城市附加费已删除。`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "删除城市附加费失败";
          setError(msg);
        } finally {
          setSavingSurcharges(false);
        }
      })();
    },
    [setError, setSavingSurcharges, setSuccess, setSurcharges, surcharges],
  );

  const addCityToSurchargeRow = useCallback(
    (clientId: string) => {
      setSurcharges((prev) =>
        prev.map((row) =>
          row.clientId === clientId
            ? {
                ...row,
                provinceMode: "cities",
                fixedAmount: "0",
                cities: [...row.cities, createEmptySurchargeCityRow()],
                isDirty: true,
              }
            : row,
        ),
      );
    },
    [setSurcharges],
  );

  const updateSurchargeCity = useCallback(
    (
      clientId: string,
      cityClientId: string,
      patch: Partial<Pick<SurchargeConfigCityRow, "cityCode" | "cityName" | "fixedAmount" | "active">>,
    ) => {
      setSurcharges((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;
          return {
            ...row,
            cities: row.cities.map((city) =>
              city.clientId === cityClientId
                ? {
                    ...city,
                    ...patch,
                    isDirty: true,
                  }
                : city,
            ),
            isDirty: true,
          };
        }),
      );
    },
    [setSurcharges],
  );

  const removeSurchargeCity = useCallback(
    (clientId: string, cityClientId: string) => {
      setSurcharges((prev) =>
        prev.map((row) => {
          if (row.clientId !== clientId) return row;
          return {
            ...row,
            cities: row.cities.filter((city) => city.clientId !== cityClientId),
            isDirty: true,
          };
        }),
      );
    },
    [setSurcharges],
  );

  const { saveProvinceWorkspace, saveCityRow } = useSurchargeSaveActions({
    templateId,
    disabled,
    surcharges,
    provinceDrafts,
    setSurcharges,
    setProvinceDrafts,
    setSavingSurcharges,
    setError,
    setSuccess,
  });

  return {
    provinceDrafts,
    addProvinceDraft,
    updateProvinceDraft,
    removeProvinceDraft,
    clearProvinceDrafts,
    createCitySurchargeGroup,
    updateSurchargeRow,
    removeSurchargeRow,
    addCityToSurchargeRow,
    updateSurchargeCity,
    removeSurchargeCity,
    saveProvinceWorkspace,
    saveCityRow,
  };
}
