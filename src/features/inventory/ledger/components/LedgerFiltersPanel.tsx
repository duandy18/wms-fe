// src/features/inventory/ledger/components/LedgerFiltersPanel.tsx
import React, { useEffect, useMemo, useState } from "react";

import { fetchActiveWarehouses, fetchItems, type ItemOut, type WarehouseOut } from "./filters/api";
import { CANON_OPTIONS, SUB_REASON_OPTIONS } from "./filters/options";
import { isoToDateOnly, dateOnlyToIsoEndZ, dateOnlyToIsoStartZ } from "./filters/dateRange";
import {
  applyIdFromInput,
  useWarehouseDisplayValue,
  useItemDisplayValue,
} from "./filters/selectorUtils";
import { WarehouseDatalist, ItemDatalist } from "./filters/datalists";

type Props = {
  loading: boolean;

  warehouseId: string;
  setWarehouseId: (v: string) => void;

  itemId: string;
  setItemId: (v: string) => void;

  itemKeyword: string;
  setItemKeyword: (v: string) => void;

  subReason: string;
  setSubReason: (v: string) => void;

  reasonCanon: string;
  setReasonCanon: (v: string) => void;

  ref: string;
  setRef: (v: string) => void;

  traceId: string;
  setTraceId: (v: string) => void;

  timeFrom: string;
  setTimeFrom: (v: string) => void;

  timeTo: string;
  setTimeTo: (v: string) => void;

  onQuery: () => void;
  onClear: () => void;
};

export const LedgerFiltersPanel: React.FC<Props> = (p) => {
  const [collapsed, setCollapsed] = useState(false);

  const [warehouses, setWarehouses] = useState<WarehouseOut[]>([]);
  const [items, setItems] = useState<ItemOut[]>([]);
  const [optsErr, setOptsErr] = useState<string | null>(null);

  // 日期范围（可选）
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>(() => isoToDateOnly(p.timeFrom));
  const [dateTo, setDateTo] = useState<string>(() => isoToDateOnly(p.timeTo));

  // 加载仓库 / 商品下拉
  useEffect(() => {
    let alive = true;

    async function load() {
      setOptsErr(null);
      try {
        const w = await fetchActiveWarehouses();
        const i = await fetchItems();
        if (!alive) return;
        setWarehouses(w);
        setItems(i);
      } catch (e) {
        if (!alive) return;
        setWarehouses([]);
        setItems([]);
        setOptsErr(e instanceof Error ? e.message : "加载仓库 / 商品失败");
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  // 当外部 timeFrom / timeTo 有值时，自动开启日期范围
  useEffect(() => {
    if ((p.timeFrom ?? "").trim() || (p.timeTo ?? "").trim()) {
      setUseDateRange(true);
    }
  }, [p.timeFrom, p.timeTo]);

  useEffect(() => setDateFrom(isoToDateOnly(p.timeFrom)), [p.timeFrom]);
  useEffect(() => setDateTo(isoToDateOnly(p.timeTo)), [p.timeTo]);

  const whDisplay = useWarehouseDisplayValue(p.warehouseId, warehouses);
  const itemDisplay = useItemDisplayValue(p.itemId, items);

  const onPickDateFrom = (v: string) => {
    setDateFrom(v);
    setUseDateRange(true);
    p.setTimeFrom(v ? dateOnlyToIsoStartZ(v) : "");
  };

  const onPickDateTo = (v: string) => {
    setDateTo(v);
    setUseDateRange(true);
    p.setTimeTo(v ? dateOnlyToIsoEndZ(v) : "");
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    p.setTimeFrom("");
    p.setTimeTo("");
  };

  const whListId = "ledger-warehouse-list";
  const itemListId = "ledger-item-list";

  const summary = useMemo(() => {
    const xs: string[] = [];
    if (p.warehouseId) xs.push(`仓库:${p.warehouseId}`);
    if (p.itemId) xs.push(`商品:${p.itemId}`);
    if (p.itemKeyword) xs.push(`关键词:${p.itemKeyword}`);
    if (p.subReason) xs.push(`动作:${p.subReason}`);
    if (p.reasonCanon) xs.push(`类型:${p.reasonCanon}`);
    if (p.ref) xs.push(`单据:${p.ref}`);
    if (p.traceId) xs.push(`追溯号:${p.traceId}`);
    if (useDateRange && (dateFrom || dateTo)) xs.push(`日期:${dateFrom || "…"}~${dateTo || "…"} `);
    return xs.join(" · ") || "未设置筛选条件";
  }, [
    p.warehouseId,
    p.itemId,
    p.itemKeyword,
    p.subReason,
    p.reasonCanon,
    p.ref,
    p.traceId,
    useDateRange,
    dateFrom,
    dateTo,
  ]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="text-xs text-slate-600">{summary}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={p.loading}
            onClick={p.onQuery}
            className="inline-flex h-8 items-center rounded-full bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {p.loading ? "查询中…" : "查询"}
          </button>

          <button
            type="button"
            disabled={p.loading}
            onClick={p.onClear}
            className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-4 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            清空
          </button>

          <button
            type="button"
            disabled={p.loading}
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-8 items-center rounded-full border border-slate-300 bg-white px-4 text-xs text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {collapsed ? "展开筛选" : "收起筛选"}
          </button>
        </div>
      </div>

      {optsErr ? <div className="px-4 pt-3 text-xs text-rose-700">{optsErr}</div> : null}

      {collapsed ? null : (
        <div className="p-4 space-y-4">
          {/* ✅ 关键修复：必须传 id */}
          <WarehouseDatalist id={whListId} warehouses={warehouses} />
          <ItemDatalist id={itemListId} items={items} />

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm text-slate-700">
              仓库
              <input
                list={whListId}
                value={whDisplay}
                onChange={(e) => applyIdFromInput(e.target.value, p.setWarehouseId)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                placeholder="选择或输入仓库"
              />
            </label>

            <label className="text-sm text-slate-700">
              商品
              <input
                list={itemListId}
                value={itemDisplay}
                onChange={(e) => applyIdFromInput(e.target.value, p.setItemId)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                placeholder="选择或输入商品"
              />
            </label>

            <label className="text-sm text-slate-700">
              动作
              <select
                value={p.subReason}
                onChange={(e) => p.setSubReason(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {SUB_REASON_OPTIONS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              动作类型
              <select
                value={p.reasonCanon}
                onChange={(e) => p.setReasonCanon(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                {CANON_OPTIONS.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-700">
              关联单据
              <input
                value={p.ref}
                onChange={(e) => p.setRef(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>

            <label className="text-sm text-slate-700">
              追溯号
              <input
                value={p.traceId}
                onChange={(e) => p.setTraceId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
              />
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
              />
              按日期筛选
            </label>

            {useDateRange ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-sm text-slate-700">
                  开始日期
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onPickDateFrom(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                  />
                </label>

                <label className="text-sm text-slate-700">
                  结束日期
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => onPickDateTo(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearDates}
                    className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    清空日期
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};
