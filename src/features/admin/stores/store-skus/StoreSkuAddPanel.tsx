import React from "react";
import type { ItemBasic } from "../../../../master-data/itemsApi";

function labelOf(it: ItemBasic) {
  const sku = (it.sku ?? "").trim();
  const name = (it.name ?? "").trim();

  if (sku && name) return `${sku} · ${name}（#${it.id}）`;
  if (sku) return `${sku}（#${it.id}）`;
  if (name) return `${name}（#${it.id}）`;
  return `#${it.id}`;
}

export function StoreSkuAddPanel(props: {
  canWrite: boolean;
  loading: boolean;

  kw: string;
  onKwChange: (v: string) => void;

  cands: ItemBasic[];
  itemsLoading: boolean;
  itemsError: string | null;

  selectedItemId: number | "";
  onSelectItemId: (v: number | "") => void;

  onAdd: () => void;
  onSearch: () => void;
}) {
  const {
    canWrite,
    loading,
    kw,
    onKwChange,
    cands,
    itemsLoading,
    itemsError,
    selectedItemId,
    onSelectItemId,
    onAdd,
    onSearch,
  } = props;

  const q = kw.trim();
  const hasKw = !!q;

  const statusText = itemsLoading
    ? "搜索中…"
    : itemsError
    ? null
    : hasKw
    ? cands.length === 0
      ? `无匹配结果：${q}`
      : `找到 ${cands.length} 条匹配`
    : null;

  const statusClass =
    hasKw && !itemsLoading && !itemsError && cands.length === 0
      ? "text-amber-700"
      : "text-slate-500";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* 搜索框 + 搜索按钮 */}
        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500">搜索商品</div>
          <div className="flex items-center gap-2">
            <input
              className="h-9 w-72 rounded border border-slate-300 px-2 text-sm"
              value={kw}
              onChange={(e) => onKwChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearch();
                }
              }}
              placeholder="SKU / 名称 / ID"
            />
            <button
              type="button"
              onClick={onSearch}
              disabled={itemsLoading}
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              title="回车也可以搜索"
            >
              搜索
            </button>
          </div>

          {itemsError ? <div className="text-[11px] text-red-600">{itemsError}</div> : null}
          {statusText ? <div className={`text-[11px] ${statusClass}`}>{statusText}</div> : null}
        </div>

        {/* SKU 下拉 */}
        <div className="flex flex-col gap-1">
          <div className="text-xs text-slate-500">选择 SKU</div>
          <select
            className="h-9 w-[520px] rounded border border-slate-300 bg-white px-2 text-sm"
            value={selectedItemId}
            onChange={(e) => onSelectItemId(e.target.value ? Number(e.target.value) : "")}
            disabled={!canWrite || loading || itemsLoading}
          >
            <option value="">
              {itemsLoading
                ? "加载中…"
                : hasKw
                ? cands.length === 0
                  ? "无匹配结果"
                  : "请选择商品"
                : cands.length > 0
                ? "请选择商品"
                : "加载默认列表中…"}
            </option>

            {cands.map((it) => (
              <option key={it.id} value={it.id}>
                {labelOf(it)}
              </option>
            ))}
          </select>
        </div>

        {/* 加入按钮 */}
        <button
          type="button"
          onClick={onAdd}
          disabled={!canWrite || loading || selectedItemId === "" || itemsLoading}
          className="h-9 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          加入商铺
        </button>
      </div>
    </div>
  );
}
