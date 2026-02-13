// src/features/admin/stores/components/useStoreOrderIngestSimulator.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MerchantOrderLineOut } from "./StoreOrderMerchantInputsCard";

type CartState = Record<
  string,
  {
    checked: boolean;
    qtyText: string;
  }
>;

function isBlank(s: string): boolean {
  return s.trim().length === 0;
}

function parsePositiveInt(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
}

function idxKey(idx: number): string {
  return String(idx);
}

export type StoreOrderIngestSelectedLine = {
  filled_code: string;
  qty: number;
  title: string | null;
  spec: string | null;
};

export type StoreOrderSimCartSeed = {
  province: string;
  city: string;
  items: Array<{ idx: number; checked: boolean; qtyText: string }>;
};

export function useStoreOrderIngestSimulator(args: { merchantLines: MerchantOrderLineOut[]; seedRev?: number; seed?: StoreOrderSimCartSeed | null }) {
  const { merchantLines, seedRev, seed } = args;

  const [province, setProvince] = useState<string>("河北省");
  const [city, setCity] = useState<string>("廊坊市");

  const [cart, setCart] = useState<CartState>({});

  // ✅ 固定 6 行：无论 merchantLines 是否为空，都保证 cart 有 0..5
  useEffect(() => {
    setCart((prev) => {
      const next: CartState = { ...prev };
      for (let idx = 0; idx < 6; idx += 1) {
        const k = idxKey(idx);
        if (!next[k]) next[k] = { checked: false, qtyText: "1" };
      }
      // 防御性清理：只允许 0..5
      for (const k of Object.keys(next)) {
        const i = Number(k);
        if (!Number.isFinite(i) || i < 0 || i >= 6) delete next[k];
      }
      return next;
    });
  }, [merchantLines]);

  // ✅ 从后端工作区注入（切店铺/刷新后保持一致）
  useEffect(() => {
    if (!seed) return;

    setProvince(seed.province);
    setCity(seed.city);

    setCart((prev) => {
      const next: CartState = { ...prev };

      // 先确保 0..5 都存在
      for (let idx = 0; idx < 6; idx += 1) {
        const k = idxKey(idx);
        if (!next[k]) next[k] = { checked: false, qtyText: "1" };
      }

      // 再按 seed 覆盖
      for (const it of seed.items) {
        const idx = Number(it.idx);
        if (!Number.isFinite(idx) || idx < 0 || idx >= 6) continue;
        next[idxKey(idx)] = { checked: Boolean(it.checked), qtyText: it.qtyText ?? "1" };
      }

      // 最后防御性清理
      for (const k of Object.keys(next)) {
        const i = Number(k);
        if (!Number.isFinite(i) || i < 0 || i >= 6) delete next[k];
      }

      return next;
    });
  }, [seedRev, seed]);

  const lineModels = useMemo(() => {
    const out: Array<{
      idx: number;
      line: MerchantOrderLineOut;
      checked: boolean;
      qtyText: string;
      qty: number | null;
      qtyOk: boolean;
    }> = [];

    for (let idx = 0; idx < 6; idx += 1) {
      const line: MerchantOrderLineOut =
        merchantLines[idx] ?? {
          filled_code: "",
          title: null,
          spec: null,
        };
      const st = cart[idxKey(idx)] ?? { checked: false, qtyText: "1" };
      const qty = st.checked ? parsePositiveInt(st.qtyText) : null;
      const qtyOk = !st.checked || qty !== null;

      out.push({
        idx,
        line,
        checked: st.checked,
        qtyText: st.qtyText,
        qty,
        qtyOk,
      });
    }
    return out;
  }, [merchantLines, cart]);

  const selectedLines = useMemo<StoreOrderIngestSelectedLine[]>(() => {
    return lineModels
      .map((m) => {
        if (!m.checked) return null;
        if (m.qty === null) return null;
        return {
          filled_code: m.line.filled_code,
          qty: m.qty,
          title: m.line.title ?? null,
          spec: m.line.spec ?? null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [lineModels]);

  const hasAnyChecked = useMemo(() => lineModels.some((x) => x.checked), [lineModels]);
  const hasAnySelectedInvalidQty = useMemo(() => lineModels.some((x) => x.checked && !x.qtyOk), [lineModels]);

  const validateMessage = useMemo(() => {
    if (isBlank(province) || isBlank(city)) return "请先填写 province/city（顶层字段）";
    if (!hasAnyChecked) return "请至少勾选 1 行";
    if (hasAnySelectedInvalidQty) return "已勾选行存在 qty 不合法（必须为正整数）";
    if (selectedLines.length === 0) return "请至少勾选 1 行并填写 qty（正整数）";
    return null;
  }, [province, city, hasAnyChecked, hasAnySelectedInvalidQty, selectedLines.length]);

  const canExecute = validateMessage === null;

  const quickFillOk = useCallback(() => {
    setProvince("河北省");
    setCity("廊坊市");
  }, []);

  const quickFillBlocked = useCallback(() => {
    setProvince("火星省");
    setCity("廊坊市");
  }, []);

  const toggleChecked = useCallback((idx: number, checked: boolean) => {
    setCart((prev) => {
      const k = idxKey(idx);
      const cur = prev[k] ?? { checked: false, qtyText: "1" };
      return { ...prev, [k]: { checked, qtyText: cur.qtyText ?? "1" } };
    });
  }, []);

  const setQtyText = useCallback((idx: number, qtyText: string) => {
    setCart((prev) => {
      const k = idxKey(idx);
      const cur = prev[k] ?? { checked: false, qtyText: "1" };
      return { ...prev, [k]: { checked: cur.checked ?? false, qtyText } };
    });
  }, []);

  return {
    state: {
      province,
      city,
      lineModels,
      selectedLines,
      canExecute,
      validateMessage,
    },
    actions: {
      setProvince,
      setCity,
      quickFillOk,
      quickFillBlocked,
      toggleChecked,
      setQtyText,
    },
  };
}

export type StoreOrderIngestSimModel = ReturnType<typeof useStoreOrderIngestSimulator>;
