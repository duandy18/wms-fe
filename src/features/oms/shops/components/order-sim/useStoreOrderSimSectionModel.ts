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

type CustomerDraft = {
  receiver_name: string;
  receiver_phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  zipcode: string;
};

function emptyCustomerDraft(): CustomerDraft {
  return {
    receiver_name: "",
    receiver_phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
    zipcode: "",
  };
}

function asStr(v: unknown): string {
  if (v == null) return "";
  return String(v);
}

function asNullableString(v: unknown): string | null {
  if (typeof v === "string") {
    const t = v.trim();
    return t.length > 0 ? t : null;
  }
  return null;
}

function pickCustomerDraftFromCartItems(items: unknown): CustomerDraft {
  if (!Array.isArray(items)) return emptyCustomerDraft();

  const rows = items.filter((x): x is Record<string, unknown> => typeof x === "object" && x !== null);

  const hasAnyCustomer = (r: Record<string, unknown>) => {
    const keys: (keyof CustomerDraft)[] = [
      "receiver_name",
      "receiver_phone",
      "province",
      "city",
      "district",
      "detail",
      "zipcode",
    ];
    return keys.some((k) => asStr(r[k]).trim().length > 0);
  };

  const checkedRows = rows.filter((r) => Boolean(r.checked));
  const candidates = checkedRows.length > 0 ? checkedRows : rows;

  const best = candidates.find(hasAnyCustomer) ?? rows.find(hasAnyCustomer);
  if (!best) return emptyCustomerDraft();

  return {
    receiver_name: asStr(best.receiver_name),
    receiver_phone: asStr(best.receiver_phone),
    province: asStr(best.province),
    city: asStr(best.city),
    district: asStr(best.district),
    detail: asStr(best.detail),
    zipcode: asStr(best.zipcode),
  };
}

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

  // ✅ customer (order-level draft)
  customerDraft: CustomerDraft;
  setCustomerDraft: (next: CustomerDraft) => void;

  // shared sim model
  sim: ReturnType<typeof useStoreOrderIngestSimulator>;

  // actions
  saveMerchantLines: (rows: MerchantOrderLineInput[]) => Promise<void>;
  saveCart: () => Promise<void>;
  resetCartWorkspace: () => Promise<void>;
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

  // ✅ customer draft
  const [customerDraft, setCustomerDraft] = useState<CustomerDraft>(emptyCustomerDraft());

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

        const cartRec = cart as unknown as Record<string, unknown>;
        const seed = cartSeedFromApi(asNullableString(cartRec.province), asNullableString(cartRec.city), cart.items);
        setCartSeed(seed);
        setCartSeedRev((x) => x + 1);

        setCustomerDraft(pickCustomerDraftFromCartItems(cart.items));
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

    const customer = {
      receiver_name: customerDraft.receiver_name.trim(),
      receiver_phone: customerDraft.receiver_phone.trim(),
      province: customerDraft.province.trim(),
      city: customerDraft.city.trim(),
      district: customerDraft.district.trim(),
      detail: customerDraft.detail.trim(),
      zipcode: customerDraft.zipcode.trim(),
    };

    const payloadItems = sim.state.lineModels.map((m) => {
      const qty = m.checked ? parsePositiveInt(m.qtyText) : parseNonNegativeIntOrZero(m.qtyText);
      if (m.checked && qty == null) {
        throw new Error(`第 ${m.idx + 1} 行已勾选，但 qty 非法（必须为正整数）`);
      }

      const base = {
        row_no: m.idx + 1,
        checked: Boolean(m.checked),
        qty: m.checked ? (qty as number) : (qty as number),
        if_version: cartVersions[m.idx] ?? 0,
      };

      if (!m.checked) return base;

      return {
        ...base,
        receiver_name: customer.receiver_name ? customer.receiver_name : null,
        receiver_phone: customer.receiver_phone ? customer.receiver_phone : null,
        province: customer.province ? customer.province : null,
        city: customer.city ? customer.city : null,
        district: customer.district ? customer.district : null,
        detail: customer.detail ? customer.detail : null,
        zipcode: customer.zipcode ? customer.zipcode : null,
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

      const outRec = out as unknown as Record<string, unknown>;
      const seed = cartSeedFromApi(asNullableString(outRec.province), asNullableString(outRec.city), out.items);
      setCartSeed(seed);
      setCartSeedRev((x) => x + 1);

      setCustomerDraft(pickCustomerDraftFromCartItems(out.items));
      setCartJustSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setCartSaveError(msg);
    } finally {
      setCartSaving(false);
    }
  }

  // ✅ 新增：清空工作区（用于“下一单”）
  async function resetCartWorkspace(): Promise<void> {
    setCartSaveError(null);
    setCartJustSaved(false);

    if (!enabled) {
      setCartSaveError("仅测试店铺允许使用订单模拟。");
      return;
    }

    const payloadItems = new Array(6).fill(0).map((_, idx) => ({
      row_no: idx + 1,
      checked: false,
      qty: 0,
      receiver_name: null,
      receiver_phone: null,
      province: null,
      city: null,
      district: null,
      detail: null,
      zipcode: null,
      if_version: cartVersions[idx] ?? 0,
    }));

    setCartSaving(true);
    try {
      const out = await putOrderSimCart(storeId, {
        province: null,
        city: null,
        items: payloadItems,
      });

      setCartVersions(cartVersionsFromApi(out.items));
      const seed = cartSeedFromApi(null, null, out.items);
      setCartSeed(seed);
      setCartSeedRev((x) => x + 1);

      setCustomerDraft(emptyCustomerDraft());
      setCartJustSaved(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "清空失败";
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

    customerDraft,
    setCustomerDraft,

    sim,

    saveMerchantLines,
    saveCart,
    resetCartWorkspace,
  };
}
