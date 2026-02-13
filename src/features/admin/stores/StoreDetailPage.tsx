// src/features/admin/stores/StoreDetailPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../../components/ui/PageTitle";

import { StorePlatformAuthCard } from "./StorePlatformAuthCard";
import { useStoreDetailPresenter } from "./useStoreDetailPresenter";

import { useStoreMetaForm } from "./hooks/useStoreMetaForm";
import { StoreMetaCard } from "./components/StoreMetaCard";
import { StoreCredentialsPanel } from "./components/StoreCredentialsPanel";

import StoreFulfillmentPolicyCard from "./components/StoreFulfillmentPolicyCard";
import { StoreMerchantCodeFskuGovernanceCard } from "./components/StoreMerchantCodeFskuGovernanceCard";

import {
  StoreOrderMerchantInputsCard,
  type MerchantOrderLineInput,
  type MerchantOrderLineOut,
} from "./components/StoreOrderMerchantInputsCard";
import { StoreOrderCustomerSubmitCard } from "./components/StoreOrderCustomerSubmitCard";
import { StoreOrderIngestExecuteCard } from "./components/StoreOrderIngestExecuteCard";
import { useStoreOrderIngestSimulator, type StoreOrderSimCartSeed } from "./components/useStoreOrderIngestSimulator";
import {
  fetchOrderSimFilledCodeOptions,
  fetchOrderSimMerchantLines,
  fetchOrderSimCart,
  putOrderSimMerchantLines,
  putOrderSimCart,
  type OrderSimFilledCodeOption,
  type OrderSimMerchantLineRow,
  type OrderSimCartRow,
} from "./api";

function makeEmptyRows(): MerchantOrderLineInput[] {
  return new Array(6).fill(null).map(() => ({
    filled_code: "",
    title: "",
    spec: "",
  }));
}

function normalizeRowText(s: string): string {
  return (s ?? "").trim();
}

function rowsFromApi(items: OrderSimMerchantLineRow[]): MerchantOrderLineInput[] {
  const byNo = new Map<number, OrderSimMerchantLineRow>();
  for (const it of items) byNo.set(Number(it.row_no), it);

  const out: MerchantOrderLineInput[] = [];
  for (let rn = 1; rn <= 6; rn += 1) {
    const r = byNo.get(rn);
    out.push({
      filled_code: r?.filled_code ?? "",
      title: r?.title ?? "",
      spec: r?.spec ?? "",
    });
  }
  return out;
}

function versionsFromApi(items: OrderSimMerchantLineRow[]): number[] {
  const byNo = new Map<number, number>();
  for (const it of items) byNo.set(Number(it.row_no), Number(it.version ?? 0));

  const out: number[] = [];
  for (let rn = 1; rn <= 6; rn += 1) out.push(byNo.get(rn) ?? 0);
  return out;
}

function cartVersionsFromApi(items: OrderSimCartRow[]): number[] {
  const byNo = new Map<number, number>();
  for (const it of items) byNo.set(Number(it.row_no), Number(it.version ?? 0));

  const out: number[] = [];
  for (let rn = 1; rn <= 6; rn += 1) out.push(byNo.get(rn) ?? 0);
  return out;
}

function cartSeedFromApi(province: string | null, city: string | null, items: OrderSimCartRow[]): StoreOrderSimCartSeed {
  const byNo = new Map<number, OrderSimCartRow>();
  for (const it of items) byNo.set(Number(it.row_no), it);

  const seedItems: Array<{ idx: number; checked: boolean; qtyText: string }> = [];
  for (let rn = 1; rn <= 6; rn += 1) {
    const r = byNo.get(rn);
    seedItems.push({
      idx: rn - 1,
      checked: Boolean(r?.checked ?? false),
      qtyText: String(r?.qty ?? 0),
    });
  }

  return {
    province: province ?? "河北省",
    city: city ?? "廊坊市",
    items: seedItems,
  };
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

function parseNonNegativeIntOrZero(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n)) return 0;
  if (!Number.isInteger(n)) return 0;
  if (n < 0) return 0;
  return n;
}

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const parsedId = storeId ? Number(storeId) : NaN;
  const invalidId = !storeId || Number.isNaN(parsedId);

  const p = useStoreDetailPresenter(Number.isNaN(parsedId) ? 0 : parsedId);

  const meta = useStoreMetaForm({
    detail: p.detail
      ? {
          store_id: p.detail.store_id,
          platform: p.detail.platform,
          shop_id: p.detail.shop_id,
          name: p.detail.name,
          email: p.detail.email,
          contact_name: p.detail.contact_name,
          contact_phone: p.detail.contact_phone,
        }
      : null,
    canWrite: p.canWrite,
  });

  // ✅ 商家后台输入（固定 6 行）
  const [merchantRows, setMerchantRows] = useState<MerchantOrderLineInput[]>(makeEmptyRows());
  const [merchantVersions, setMerchantVersions] = useState<number[]>(new Array(6).fill(0));
  const [merchantValidLines, setMerchantValidLines] = useState<MerchantOrderLineOut[]>([]);

  // ✅ 填写码候选（下拉）
  const [filledCodeOptions, setFilledCodeOptions] = useState<OrderSimFilledCodeOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // ✅ 商家保存状态
  const [merchantSaving, setMerchantSaving] = useState(false);
  const [merchantSaveError, setMerchantSaveError] = useState<string | null>(null);
  const [merchantJustSaved, setMerchantJustSaved] = useState(false);

  // ✅ 商家初始加载状态
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantLoadError, setMerchantLoadError] = useState<string | null>(null);

  // ✅ 客户 cart 工作区（版本 + seed 注入）
  const [cartVersions, setCartVersions] = useState<number[]>(new Array(6).fill(0));
  const [cartSeed, setCartSeed] = useState<StoreOrderSimCartSeed | null>(null);
  const [cartSeedRev, setCartSeedRev] = useState(0);

  const [cartLoading, setCartLoading] = useState(false);
  const [cartLoadError, setCartLoadError] = useState<string | null>(null);

  const [cartSaving, setCartSaving] = useState(false);
  const [cartSaveError, setCartSaveError] = useState<string | null>(null);
  const [cartJustSaved, setCartJustSaved] = useState(false);

  // ✅ 客户输入模型：共享给“客户输入卡”和“执行卡”
  const sim = useStoreOrderIngestSimulator({ merchantLines: merchantValidLines, seedRev: cartSeedRev, seed: cartSeed });

  useEffect(() => {
    if (!p.detail) return;

    const sid = p.detail.store_id;
    let cancelled = false;

    setMerchantLoading(true);
    setMerchantLoadError(null);

    setOptionsLoading(true);
    setOptionsError(null);

    setCartLoading(true);
    setCartLoadError(null);

    Promise.all([fetchOrderSimMerchantLines(sid), fetchOrderSimFilledCodeOptions(sid), fetchOrderSimCart(sid)])
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
  }, [p.detail]);

  async function saveMerchantLines(rows: MerchantOrderLineInput[]): Promise<void> {
    setMerchantSaveError(null);
    setMerchantJustSaved(false);

    if (!p.detail) {
      setMerchantSaveError("店铺详情未加载，无法保存。");
      return;
    }

    const sid = p.detail.store_id;

    // ✅ 先规范化输入（trim）
    const normalizedRows = rows.slice(0, 6).map((r) => ({
      filled_code: normalizeRowText(r.filled_code),
      title: normalizeRowText(r.title),
      spec: normalizeRowText(r.spec),
    }));

    const payloadItems = normalizedRows.map((r, idx) => ({
      row_no: idx + 1,
      filled_code: r.filled_code ? r.filled_code : null,
      title: r.title ? r.title : null,
      // spec 前端传不传都无所谓：后端会强制重算，这里传 null 更明确
      spec: null as string | null,
      if_version: merchantVersions[idx] ?? 0,
    }));

    setMerchantSaving(true);
    try {
      const items = await putOrderSimMerchantLines(sid, { items: payloadItems });
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

    if (!p.detail) {
      setCartSaveError("店铺详情未加载，无法保存。");
      return;
    }

    const sid = p.detail.store_id;

    // ✅ 契约对齐：qty 永远发 integer
    // - 勾选行：qty 必须 >= 1
    // - 未勾选行：qty 允许为 0（默认 0）
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
      const out = await putOrderSimCart(sid, {
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

  const storeOrderGenEnabled = useMemo(() => {
    return true;
  }, []);

  if (invalidId) {
    return <div className="p-4 text-sm text-red-600">缺少 storeId 参数（或参数非法）</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <PageTitle title="商铺详情" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          >
            返回商铺管理
          </button>
        </div>
      </div>

      {p.error && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{p.error}</div>}

      {meta.metaError && <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{meta.metaError}</div>}
      {meta.metaJustSaved && !meta.metaError && (
        <div className="rounded border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">店铺基础信息已保存。</div>
      )}

      {p.credentialsOpen && p.detail && (
        <StoreCredentialsPanel
          platform={p.detail.platform}
          shopId={p.detail.shop_id}
          storeId={p.detail.store_id}
          token={p.credentialsToken}
          error={p.credentialsError}
          saving={p.credentialsSaving}
          onChangeToken={p.setCredentialsToken}
          onClose={p.closeCredentials}
          onSubmit={p.submitCredentials}
        />
      )}

      {p.loading && !p.detail ? (
        <div className="text-sm text-slate-500">加载中…</div>
      ) : !p.detail ? (
        <div className="text-sm text-slate-500">未找到店铺。</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <StoreMetaCard
                detail={{
                  store_id: p.detail.store_id,
                  platform: p.detail.platform,
                  shop_id: p.detail.shop_id,
                  name: p.detail.name,
                  email: p.detail.email,
                  contact_name: p.detail.contact_name,
                  contact_phone: p.detail.contact_phone,
                }}
                canWrite={p.canWrite}
                name={meta.name}
                setName={meta.setName}
                email={meta.email}
                setEmail={meta.setEmail}
                contactName={meta.contactName}
                setContactName={meta.setContactName}
                contactPhone={meta.contactPhone}
                setContactPhone={meta.setContactPhone}
                savingMeta={meta.savingMeta}
                metaJustSaved={meta.metaJustSaved}
                onDirty={meta.markDirty}
                onSubmit={meta.save}
              />
            </div>

            <div className="min-w-0">
              <StorePlatformAuthCard
                detailPlatform={p.detail.platform}
                detailShopId={p.detail.shop_id}
                detailStoreId={p.detail.store_id}
                auth={p.platformAuth}
                loading={p.authLoading}
                onManualCredentialsClick={p.openCredentials}
                onOAuthClick={p.startOAuth}
                oauthStarting={p.oauthStarting}
                oauthError={p.oauthError}
              />
            </div>
          </div>

          <StoreFulfillmentPolicyCard storeId={p.detail.store_id} canWrite={p.canWrite} bindings={p.detail.bindings ?? []} onReload={p.reloadDetail} />

          <StoreMerchantCodeFskuGovernanceCard
            platform={p.detail.platform as unknown as "PDD" | "JD" | "TMALL" | "OTHER"}
            shopId={p.detail.shop_id}
            storeName={p.detail.name}
            canWrite={p.canWrite}
          />

          {storeOrderGenEnabled ? (
            <div className="space-y-4">
              {merchantLoadError ? (
                <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">商家清单加载失败：{merchantLoadError}</div>
              ) : null}

              {merchantLoading ? <div className="text-sm text-slate-500">商家清单加载中…</div> : null}

              <StoreOrderMerchantInputsCard
                rows={merchantRows}
                onChangeRows={setMerchantRows}
                onSave={saveMerchantLines}
                saving={merchantSaving}
                saveError={merchantSaveError}
                justSaved={merchantJustSaved}
                onValidLinesChange={setMerchantValidLines}
                filledCodeOptions={filledCodeOptions}
                optionsLoading={optionsLoading}
                optionsError={optionsError}
              />

              {cartLoadError ? (
                <div className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">客户输入加载失败：{cartLoadError}</div>
              ) : null}

              {cartLoading ? <div className="text-sm text-slate-500">客户输入加载中…</div> : null}

              <StoreOrderCustomerSubmitCard
                platform={String(p.detail.platform).toUpperCase()}
                shopId={String(p.detail.shop_id)}
                storeId={p.detail.store_id}
                model={sim}
                onSave={saveCart}
                saving={cartSaving}
                saveError={cartSaveError}
                justSaved={cartJustSaved}
              />

              <StoreOrderIngestExecuteCard
                platform={String(p.detail.platform).toUpperCase()}
                shopId={String(p.detail.shop_id)}
                storeId={p.detail.store_id}
                model={sim}
              />

              <div className="text-xs text-slate-500">提示：商家卡=维护并保存可售卖清单（事实）；客户卡=输入并保存（工作区）；执行卡=调用 ingest 并展示最近一次结果。</div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
