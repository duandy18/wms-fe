// src/features/operations/inbound/supplement/panel/useItemShelfLifePolicy.ts

import { useEffect, useState } from "react";
import type { ShelfLifeUnit } from "../dateUtils";
import { fetchItemShelfLifePolicy, patchItemShelfLifePolicy } from "../api";

export function useItemShelfLifePolicy(itemId: number | null) {
  const [policyLoading, setPolicyLoading] = useState(false);
  const [policyErr, setPolicyErr] = useState<string | null>(null);

  const [hasShelfLife, setHasShelfLife] = useState<boolean>(false);
  const [shelfValue, setShelfValue] = useState<string>("");
  const [shelfUnit, setShelfUnit] = useState<ShelfLifeUnit>("MONTH");

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!itemId) return;

      setPolicyLoading(true);
      setPolicyErr(null);
      try {
        const p = await fetchItemShelfLifePolicy(itemId);
        if (!alive) return;

        setHasShelfLife(!!p.has_shelf_life);
        setShelfValue(p.shelf_life_value == null ? "" : String(p.shelf_life_value));
        setShelfUnit((p.shelf_life_unit ?? "MONTH") as ShelfLifeUnit);
      } catch (e: unknown) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : "加载商品保质期参数失败";
        setPolicyErr(msg);
        setHasShelfLife(false);
        setShelfValue("");
        setShelfUnit("MONTH");
      } finally {
        if (alive) setPolicyLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [itemId]);

  async function saveToItem(targetItemId: number) {
    setPolicyErr(null);

    const v = shelfValue.trim();
    const n = v ? Number(v) : null;

    if (hasShelfLife) {
      if (!v) {
        throw new Error("保质期管理为“有”时，建议填写保质期数值（用于推算到期日期）。");
      }
      if (!Number.isFinite(n as number) || (n as number) <= 0) {
        throw new Error("保质期数值必须为正整数。");
      }
    }

    await patchItemShelfLifePolicy({
      itemId: targetItemId,
      has_shelf_life: hasShelfLife,
      shelf_life_value: hasShelfLife ? Math.floor(n as number) : null,
      shelf_life_unit: hasShelfLife ? shelfUnit : null,
    });
  }

  return {
    policyLoading,
    policyErr,
    setPolicyErr,

    hasShelfLife,
    shelfValue,
    shelfUnit,

    setHasShelfLife,
    setShelfValue,
    setShelfUnit,

    saveToItem,
  };
}
