// src/features/admin/shipping-providers/scheme/workbench/state/surcharges.ts
//
// 分拆说明：
// - 从 usePricingWorkbench.ts 中拆出。
// - 当前只负责“附加费”子域动作：新增 / 修改 / 删除 / 保存。
// - 当前不负责：
//   1) modules / ranges / groups / matrix 逻辑
//   2) 页面级状态装配
// - 协作关系：
//   - 被 ../usePricingWorkbench 装配
//   - 依赖 ../../../api/surcharges 与 ./mappers
// - 维护约束：
//   - surcharge 的保存真相收口在这里；不要再把 upsert/delete 逻辑塞回 UI 层。

import { useCallback } from "react";
import type { PricingSchemeSurcharge } from "../../../api/types";
import { deleteSurcharge, patchSurcharge, upsertSurcharge } from "../../../api/surcharges";
import { newClientId, parseRequiredNumber } from "../domain/derived";
import type { SurchargeRuleRow } from "../domain/types";
import { mapSurchargeApiToRow, surchargeScopeKey } from "./mappers";

type Args = {
  schemeId: number;
  disabled: boolean;
  surcharges: SurchargeRuleRow[];
  setSurcharges: React.Dispatch<React.SetStateAction<SurchargeRuleRow[]>>;
  setSavingSurcharges: React.Dispatch<React.SetStateAction<boolean>>;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
};

export function useSurchargeActions(args: Args) {
  const {
    schemeId,
    disabled,
    surcharges,
    setSurcharges,
    setSavingSurcharges,
    setError,
    setSuccess,
  } = args;

  const addSurchargeRow = useCallback(() => {
    setSurcharges((prev) => [
      ...prev,
      {
        id: undefined,
        clientId: newClientId("surcharge"),
        originalKey: null,
        name: "",
        active: true,
        scope: "province",
        provinceCode: "",
        provinceName: "",
        cityName: "",
        fixedAmount: "",
        isNew: true,
        isDirty: true,
        isDeleted: false,
      },
    ]);
  }, [setSurcharges]);

  const updateSurchargeRow = useCallback(
    (
      clientId: string,
      patch: Partial<
        Pick<
          SurchargeRuleRow,
          "name" | "active" | "scope" | "provinceCode" | "provinceName" | "cityName" | "fixedAmount"
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

          if (next.scope === "province") {
            next.cityName = "";
          }

          return next;
        }),
      );
    },
    [setSurcharges],
  );

  const removeSurchargeRow = useCallback(
    (clientId: string) => {
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
    },
    [setSurcharges],
  );

  const saveSurcharges = useCallback(async () => {
    if (disabled) return false;

    const alive = surcharges.filter((x) => !x.isDeleted);

    for (const row of alive) {
      if (!row.provinceName.trim()) {
        setError("附加费必须填写省份");
        return false;
      }
      if (row.scope === "city" && !row.cityName.trim()) {
        setError("市级附加费必须填写城市");
        return false;
      }
      const amount = parseRequiredNumber(row.fixedAmount);
      if (amount === null || amount < 0) {
        setError("附加费金额必须为非负数");
        return false;
      }
    }

    setSavingSurcharges(true);
    setError(null);
    setSuccess(null);

    try {
      const deletedRows = surcharges.filter((x) => x.isDeleted && typeof x.id === "number");
      const desiredRows = surcharges.filter((x) => !x.isDeleted);

      const savedRows: PricingSchemeSurcharge[] = [];

      for (const row of desiredRows) {
        const saved = await upsertSurcharge(schemeId, {
          scope: row.scope,
          province: row.provinceName,
          city: row.scope === "city" ? row.cityName : null,
          amount: Number(row.fixedAmount.trim()),
          active: row.active,
          name: row.name.trim() || undefined,
        });
        savedRows.push(saved);

        const nextKey = surchargeScopeKey(row.scope, row.provinceName, row.cityName);
        if (row.id && row.originalKey && row.originalKey !== nextKey) {
          await patchSurcharge(row.id, { active: false });
          await deleteSurcharge(row.id);
        }
      }

      for (const row of deletedRows) {
        await patchSurcharge(row.id as number, { active: false });
        await deleteSurcharge(row.id as number);
      }

      setSurcharges(savedRows.map(mapSurchargeApiToRow));
      setSuccess("附加费已保存。");
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存附加费失败";
      setError(msg);
      return false;
    } finally {
      setSavingSurcharges(false);
    }
  }, [
    disabled,
    schemeId,
    setError,
    setSavingSurcharges,
    setSuccess,
    setSurcharges,
    surcharges,
  ]);

  return {
    addSurchargeRow,
    updateSurchargeRow,
    removeSurchargeRow,
    saveSurcharges,
  };
}
