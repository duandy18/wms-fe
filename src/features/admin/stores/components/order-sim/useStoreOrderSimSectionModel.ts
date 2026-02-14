// src/features/admin/stores/components/order-sim/useStoreOrderSimSectionModel.ts

import { useEffect, useState } from "react";
import type { MerchantOrderLineInput, MerchantOrderLineOut } from "../StoreOrderMerchantInputsCard";
import { useStoreOrderIngestSimulator, type StoreOrderSimCartSeed } from "../useStoreOrderIngestSimulator";
import {
  fetchOrderSimCart,
  fetchOrderSimFilledCodeOptions,
  fetchOrderSimMerchantLines,
  putOrderSimCart,
  putOrderSimMerchantLines,
  type OrderSimFilledCodeOption,
} from "../../api";
import {
  cartSeedFromApi,
  cartVersionsFromApi,
  makeEmptyMerchantRows,
  normalizeRowText,
  parseNonNegativeIntOrZero,
  parsePositiveInt,
  rowsFromApi,
  versionsFromApi,
} from "./utils";

export function useStoreOrderSimSectionModel(args: {
  enabled: boolean;
  storeId: number;
}): {
  // merchant
  merchantRows: MerchantOrderLineInput[];
  setMerchantRows: (rows: MerchantOrderLineInput[]) => void;
  merchantSaving: boolean;
  merchantSaveError: string | null;
  merchantJustSaved: boolean;
  merchantLoading: boolean;
  merchantLoadError: string | null;
  setMerchantValidLines: (lines: MerchantOrderLineOut[]) => void;

  // options
  filledCodeOptions: OrderSimFilledCodeOption[];
  optionsLoading: boolean;
  optionsError: string | null;

  // cart
  cartLoading: boolean;
  cartLoadError: string | null;
  cartSaving: boolean;
  cartSaveError: string | null;
  cartJustSaved: boolean;

  // shared sim model
  sim: ReturnType<typeof useStoreOrderIngestSimulator>;

  // actions
  saveMerchantLines: (rows: MerchantOrderLineInput[]) => Promise<void>;
  saveCart: () => Promise<void>;
} {
  const { enabled, storeId } = args;

  // merchant
  const [merchantRows, setMerchantRows] = useState<MerchantOrderLineInput[]>(makeEmptyMerchantRows());
  const [merchantVersions, setMerchantVersions] = useState<number[]>(new Array(6).fill(0));
  const [merchantValidLines, setMerchantValidLines] = useState<MerchantOrderLineOut[]>([]);

  const [merchantSaving, setMerchantSaving] = useState(false);
  const [merchantSaveError, setMerchantSaveError] = useState<string | null>(null);
  const [merchantJustSaved, setMerchantJustSaved] = useState(false);

  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantLoadError, setMerchantLoadError] = useState<string | null>(null);

  // options
  const [filledCodeOptions, setFilledCodeOptions] = useState<OrderSimFilledCodeOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // cart
  const [cartVersions, setCartVersions] = useState<number[]>(new Array(6).fill(0));
  const [cartSeed, setCartSeed] = useState<StoreOrderSimCartSeed | null>(null);
  const [cartSeedRev, setCartSeedRev] = useState(0);

  const [cartLoading, setCartLoading] = useState(false);
  const [cartLoadError, setCartLoadError] = useState<string | null>(null);

  const [cartSaving, setCartSaving] = useState(false);
  const [cartSaveError, setCartSaveError] = useState<string | null>(null);
  const [cartJustSaved, setCartJustSaved] = useState(false);

  // shared model
  const sim = useStoreOrderIngestSimulator({ merchantLines: merchantValidLines, seedRev: cartSeedRev, seed: cartSeed });

  // load
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    setMerchantLoading(true);
    setMerchantLoadError(null);

    setOptionsLoading(true);
    setOptionsError(null);

    setCartLoading(true);
    setCartLoadError(null);

    Promise.all([fetchOrderSimMerchantLines(storeId), fetchOrderSimFilledCodeOptions(storeId), fetchOrderSimCart(storeId)])
      .then(([lines, opts, cart]) => {
        if (cancelled) return;

        setMerchantRows(rowsFromApi(lines));
        setMerchantVersions(versionsFromApi(lines));
        setFilledCodeOptions(opts);

        setCartVersions(cartVersionsFromApi(cart.items));
        const seed = cartSeedFromApi(cart.province, cart.city, cart.items);
        setCartSeed(seed);
        setCartSeedRev((x) => x + 1);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "加载失败";
        setMerchantLoadError(msg);
        setCartLoadError(msg);
      })
      .finally(() => {
        if (cancelled) return;
        setMerchantLoading(false);
        setOptionsLoading(false);
        setCartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, storeId]);

  async function saveMerchantLines(rows: MerchantOrderLineInput[]): Promise<void> {
    setMerchantSaveError(null);
    setMerchantJustSaved(false);

    if (!enabled) {
      setMerchantSaveError("仅测试店铺允许使用订单模拟。");
      return;
    }

    const normalizedRows = rows.slice(0, 6).map((r) => ({
      filled_code: normalizeRowText(r.filled_code),
      title: normalizeRowText(r.title),
      spec: normalizeRowText(r.spec),
    }));

    const payloadItems = normalizedRows.map((r, idx) => ({
      row_no: idx + 1,
      filled_code: r.filled_code ? r.filled_code : null,
      title: r.title ? r.title : null,
      spec: null as string | null,
      if_version: merchantVersions[idx] ?? 0,
    }));

    setMerchantSaving(true);
    try {
      const items = await putOrderSimMerchantLines(storeId, { items: payloadItems });
      setMerchantRows(rowsFromApi(items));
      setMerchantVersions(versionsFromApi(items));
      setMerchantJustSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setMerchantSaveError(msg);
    } finally {
      setMerchantSaving(false);
    }
  }

  async function saveCart(): Promise<void> {
    setCartSaveError(null);
    setCartJustSaved(false);

    if (!enabled) {
      setCartSaveError("仅测试店铺允许使用订单模拟。");
      return;
    }

    const payloadItems = sim.state.lineModels.map((m) => {
      const qty = m.checked ? parsePositiveInt(m.qtyText) : parseNonNegativeIntOrZero(m.qtyText);
      if (m.checked && qty == null) {
        throw new Error(`第 ${m.idx + 1} 行已勾选，但 qty 非法（必须为正整数）`);
      }
      return {
        row_no: m.idx + 1,
        checked: Boolean(m.checked),
        qty: m.checked ? (qty as number) : (qty as number),
        if_version: cartVersions[m.idx] ?? 0,
      };
    });

    setCartSaving(true);
    try {
      const out = await putOrderSimCart(storeId, {
        province: sim.state.province.trim() ? sim.state.province.trim() : null,
        city: sim.state.city.trim() ? sim.state.city.trim() : null,
        items: payloadItems,
      });

      setCartVersions(cartVersionsFromApi(out.items));
      const seed = cartSeedFromApi(out.province, out.city, out.items);
      setCartSeed(seed);
      setCartSeedRev((x) => x + 1);
      setCartJustSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setCartSaveError(msg);
    } finally {
      setCartSaving(false);
    }
  }

  return {
    merchantRows,
    setMerchantRows,
    merchantSaving,
    merchantSaveError,
    merchantJustSaved,
    merchantLoading,
    merchantLoadError,
    setMerchantValidLines,

    filledCodeOptions,
    optionsLoading,
    optionsError,

    cartLoading,
    cartLoadError,
    cartSaving,
    cartSaveError,
    cartJustSaved,

    sim,

    saveMerchantLines,
    saveCart,
  };
}
