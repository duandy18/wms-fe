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
  dataSummary: { platform?: string; shop_id?: string; item_id?: number; whCount: number };

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
  // 本地 SKU 搜索状态
  const [skuKeyword, setSkuKeyword] = useState("");
  const [skuFocused, setSkuFocused] = useState(false);

  // 平台下拉：从店铺列表抽 distinct platform
  const platformOptions = useMemo(
    () =>
      Array.from(new Set(stores.map((s) => s.platform))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [stores],
  );

  // 店铺下拉：受 platform 过滤
  const storeOptions = useMemo(
    () =>
      stores.filter((s) =>
        platform ? s.platform === platform : true,
      ),
    [stores, platform],
  );

  // SKU 搜索建议：只在有关键字时出现
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

  // 当 SKU 文本变化时，尝试自动联动 item_id：
  // - 如果唯一匹配一个 SKU 完全相等，直接把对应 item_id 写入
  // - 或者唯一匹配一个名称完全相等时，也自动带出
  function handleSkuChange(next: string) {
    setSkuKeyword(next);

    const kw = next.trim().toLowerCase();
    if (!kw) return;

    // 精确匹配 SKU
    const exactSkuMatches = items.filter(
      (it) => (it.sku ?? "").toLowerCase() === kw,
    );
    if (exactSkuMatches.length === 1) {
      setItemId(String(exactSkuMatches[0].id));
      return;
    }

    // 精确匹配名称
    const exactNameMatches = items.filter(
      (it) => (it.name ?? "").toLowerCase() === kw,
    );
    if (exactNameMatches.length === 1) {
      setItemId(String(exactNameMatches[0].id));
    }
  }

  return (
    <section className="space-y-3">
      {/* 店铺选择（先选平台，再选店铺） */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col gap-2 text-sm">
          {/* 平台下拉 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">平台</span>
            <select
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
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

          {/* 店铺下拉：受平台过滤 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">店铺</span>
            <select
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
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
          <div className="mt-1 text-[11px] text-slate-500 flex flex-wrap gap-2">
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
      <section className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">platform</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="平台代码，例如 PDD"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">shop_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="平台店铺 ID"
            />
          </div>

          {/* item_id 文本（由 SKU 搜索联动） */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">item_id</label>
            <input
              className="border rounded-lg px-3 py-2 text-sm"
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

          {/* warehouse 下拉 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">
              warehouse_id（可选）
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm"
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

        {/* SKU / 名称 搜索（用来反查 item_id） */}
        <div className="flex flex-col gap-1 text-sm relative">
          <label className="text-xs text-slate-500">
            SKU / 名称 搜索（输入关键字，从结果中选择，或精确输入 SKU 自动带出
            item_id）
          </label>
          <input
            className="border rounded-lg px-3 py-2 text-sm"
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
            <div className="mt-1 max-h-40 overflow-auto border border-slate-200 rounded-lg bg-white shadow-sm z-10">
              {suggestions.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-50"
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
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
          >
            {loading ? "查询中…" : "查询"}
          </button>
          {error && (
            <span className="text-xs text-red-600 mt-1">{error}</span>
          )}
          {dataSummary.platform && (
            <span className="text-xs text-slate-500 mt-1">
              已查询：{dataSummary.platform}/{dataSummary.shop_id} · item_id=
              {dataSummary.item_id} · {dataSummary.whCount} 个仓
            </span>
          )}
        </div>
      </section>
    </section>
  );

  // 下面是局部函数的实现，放在组件内部
  function handleSkuChange(next: string) {
    setSkuKeyword(next);

    const kw = next.trim().toLowerCase();
    if (!kw) return;

    // 精确匹配 SKU
    const exactSkuMatches = items.filter(
      (it) => (it.sku ?? "").toLowerCase() === kw,
    );
    if (exactSkuMatches.length === 1) {
      setItemId(String(exactSkuMatches[0].id));
      return;
    }

    // 精确匹配名称
    const exactNameMatches = items.filter(
      (it) => (it.name ?? "").toLowerCase() === kw,
    );
    if (exactNameMatches.length === 1) {
      setItemId(String(exactNameMatches[0].id));
    }
  }
};
