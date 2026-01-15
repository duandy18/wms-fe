// src/features/inventory/ledger/components/LedgerFiltersBody.tsx
import React from "react";

import type { ItemOut, WarehouseOut } from "./filters/api";
import { CANON_OPTIONS, SUB_REASON_OPTIONS } from "./filters/options";
import { WarehouseDatalist, ItemDatalist } from "./filters/datalists";

type Props = {
  warehouses: WarehouseOut[];
  items: ItemOut[];

  whListId: string;
  itemListId: string;

  warehouseDisplay: string;
  itemDisplay: string;

  onWarehouseInput: (raw: string) => void;
  onItemInput: (raw: string) => void;

  subReason: string;
  setSubReason: (v: string) => void;

  reasonCanon: string;
  setReasonCanon: (v: string) => void;

  ref: string;
  setRef: (v: string) => void;

  traceId: string;
  setTraceId: (v: string) => void;

  // 日期范围
  loading: boolean;
  useDateRange: boolean;
  setUseDateRange: (v: boolean) => void;
  dateFrom: string;
  dateTo: string;
  onPickDateFrom: (v: string) => void;
  onPickDateTo: (v: string) => void;
  onClearDates: () => void;
};

export const LedgerFiltersBody: React.FC<Props> = (p) => {
  return (
    <div className="p-4 space-y-4">
      <WarehouseDatalist id={p.whListId} warehouses={p.warehouses} />
      <ItemDatalist id={p.itemListId} items={p.items} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm text-slate-700">
          仓库
          <input
            list={p.whListId}
            value={p.warehouseDisplay}
            onChange={(e) => p.onWarehouseInput(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="选择或输入仓库"
          />
        </label>

        <label className="text-sm text-slate-700">
          商品
          <input
            list={p.itemListId}
            value={p.itemDisplay}
            onChange={(e) => p.onItemInput(e.target.value)}
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
            checked={p.useDateRange}
            onChange={(e) => p.setUseDateRange(e.target.checked)}
            disabled={p.loading}
          />
          按日期筛选
        </label>

        {p.useDateRange ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="text-sm text-slate-700">
              开始日期
              <input
                type="date"
                value={p.dateFrom}
                onChange={(e) => p.onPickDateFrom(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                disabled={p.loading}
              />
            </label>

            <label className="text-sm text-slate-700">
              结束日期
              <input
                type="date"
                value={p.dateTo}
                onChange={(e) => p.onPickDateTo(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
                disabled={p.loading}
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={p.onClearDates}
                className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                disabled={p.loading}
              >
                清空日期
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
