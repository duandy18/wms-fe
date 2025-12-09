// src/features/inventory/channel-inventory/ChannelInventoryFilters.tsx
import React, { useMemo, useState } from "react";
import type { StoreListItem, StoreDetailData } from "../../admin/stores/types";
import type { Item } from "../../admin/items/api";

type WarehouseOption = {
  id: number;
  name: string;
  code?: string | null;
  active?: boolean;
};

type Props = {
  platform: string;
  setPlatform: (v: string) => void;
  shopId: string;
  setShopId: (v: string) => void;
  itemId: string;
  setItemId: (v: string) => void;
  warehouseId: string;
  setWarehouseId: (v: string) => void;
  loading: boolean;
  error: string | null;
  dataSummary: {
    platform?: string;
    shop_id?: string;
    item_id?: number;
    whCount: number;
  };

  // 店铺选择
  stores: StoreListItem[];
  storesLoading: boolean;
  selectedStoreId: number | null;
  setSelectedStoreId: (id: number | null) => void;
  storeDetail: StoreDetailData | null;

  // 下拉数据
  items: Item[];
  itemsLoading: boolean;
  warehouses: WarehouseOption[];
  warehousesLoading: boolean;

  onQuery: () => void;
};

export const ChannelInventoryFilters: React.FC<Props> = ({
  platform,
  setPlatform,
  shopId,
  setShopId,
  itemId,
  setItemId,
  warehouseId,
  setWarehouseId,
  loading,
  error,
  dataSummary,
  stores,
  storesLoading,
  selectedStoreId,
  setSelectedStoreId,
  storeDetail,
  items,
  itemsLoading,
  warehouses,
  warehousesLoading,
  onQuery,
}) => {
  const [skuKeyword, setSkuKeyword] = useState("");
  const [skuFocused, setSkuFocused] = useState(false);

  const platformOptions = useMemo(
    () =>
      Array.from(new Set(stores.map((s) => s.platform))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [stores],
  );

  const storeOptions = useMemo(
    () =>
      stores.filter((s) =>
        platform ? s.platform === platform : true,
      ),
    [stores, platform],
  );

  const suggestions = useMemo(() => {
    if (!items.length) return [];
    const kw = skuKeyword.trim().toLowerCase();
    if (!kw) return [];
    return items
      .filter((it) => {
        const sku = it.sku?.toLowerCase() ?? "";
        const name = it.name?.toLowerCase() ?? "";
        return sku.includes(kw) || name.includes(kw);
      })
      .slice(0, 20);
  }, [skuKeyword, items]);

  const showSkuSuggestions =
    skuFocused && !itemsLoading && suggestions.length > 0;

  function handleSkuChange(next: string) {
    setSkuKeyword(next);

    const kw = next.trim().toLowerCase();
    if (!kw) return;

    const exactSkuMatches = items.filter(
      (it) => (it.sku ?? "").toLowerCase() === kw,
    );
    if (exactSkuMatches.length === 1) {
      setItemId(String(exactSkuMatches[0].id));
      return;
    }

    const exactNameMatches = items.filter(
      (it) => (it.name ?? "").toLowerCase() === kw,
    );
    if (exactNameMatches.length === 1) {
      setItemId(String(exactNameMatches[0].id));
    }
  }

  return (
    <section className="space-y-3">
      {/* 店铺选择 */}
      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 text-sm">
          {/* 平台下拉 */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs text-slate-500">平台</span>
            <select
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              value={platform}
              onChange={(e) => {
                const v = e.target.value;
                setPlatform(v);
                setSelectedStoreId(null);
                setShopId("");
              }}
            >
              <option value="">
                {storesLoading
                  ? "加载平台中…"
                  : "（可选）先选择平台，再选店铺"}
              </option>
              {platformOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 店铺下拉 */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs text-slate-500">店铺</span>
            <select
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              value={selectedStoreId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setSelectedStoreId(null);
                  setShopId("");
                  return;
                }
                const id = Number(v);
                setSelectedStoreId(id);
                const store = stores.find((s) => s.id === id);
                if (store) {
                  setShopId(store.shop_id);
                  setPlatform(store.platform);
                }
              }}
            >
              <option value="">
                {storeOptions.length === 0
                  ? "请先选择平台 / 或该平台暂无店铺"
                  : "选择平台下的店铺"}
              </option>
              {storeOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.platform}] {s.shop_id} · {s.name || "(未命名)"}
                  {s.active ? "" : "（停用）"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {storeDetail && (
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span>
              当前店铺：{storeDetail.platform}/{storeDetail.shop_id} ·{" "}
              {storeDetail.name || "未命名"}
            </span>
            <span className="text-slate-400">
              （绑定仓数量：{storeDetail.bindings.length}）
            </span>
          </div>
        )}
      </section>

      {/* 查询条件 + SKU 搜索 + 仓库下拉 */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">platform</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="平台代码，例如 PDD"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">shop_id</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="平台店铺 ID"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">item_id</label>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="内部 item_id（通过下方 SKU 搜索确定）"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onQuery();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">
              warehouse_id（可选）
            </label>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
            >
              <option value="">
                {warehousesLoading ? "加载仓库中…" : "全部仓库（多仓视图）"}
              </option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  WH-{w.id} · {w.name}
                  {w.code ? ` (${w.code})` : ""}
                  {w.active === false ? "（停用）" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SKU / 名称 搜索 */}
        <div className="relative flex flex-col gap-1 text-sm">
          <label className="text-xs text-slate-500">
            SKU / 名称 搜索（输入关键字，从结果中选择，或精确输入 SKU 自动带出
            item_id）
          </label>
          <input
            className="rounded-lg border px-3 py-2 text-sm"
            value={skuKeyword}
            onChange={(e) => handleSkuChange(e.target.value)}
            onFocus={() => setSkuFocused(true)}
            onBlur={() => {
              setTimeout(() => setSkuFocused(false), 150);
            }}
            placeholder={
              itemsLoading
                ? "加载商品列表中…"
                : "输入 SKU 片段或名称关键字，例如 KF-T-GS 或 猫粮"
            }
          />
          {showSkuSuggestions && (
            <div className="z-10 mt-1 max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
              {suggestions.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-[11px] hover:bg-slate-50"
                  onClick={() => {
                    setItemId(String(it.id));
                    setSkuKeyword(it.sku);
                  }}
                >
                  <div className="font-mono text-[11px]">{it.sku}</div>
                  <div className="text-[11px] text-slate-600">
                    #{it.id} · {it.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onQuery}
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {loading ? "查询中…" : "查询"}
          </button>
          {error && (
            <span className="mt-1 text-xs text-red-600">{error}</span>
          )}
          {dataSummary.platform && (
            <span className="mt-1 text-xs text-slate-500">
              已查询：{dataSummary.platform}/{dataSummary.shop_id} · item_id=
              {dataSummary.item_id} · {dataSummary.whCount} 个仓
            </span>
          )}
        </div>
      </section>
    </section>
  );
};
