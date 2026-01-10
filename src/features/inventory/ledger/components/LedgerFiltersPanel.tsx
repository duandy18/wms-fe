// src/features/inventory/ledger/components/LedgerFiltersPanel.tsx
import React, { useEffect, useState } from "react";

type Props = {
  loading: boolean;

  // ✅ 仓库
  warehouseId: string;
  setWarehouseId: (v: string) => void;

  // 商品关键词（模糊）
  itemKeyword: string;
  setItemKeyword: (v: string) => void;

  // 动作（sub_reason）
  subReason: string;
  setSubReason: (v: string) => void;

  // 动作类型（reason_canon）
  reasonCanon: string;
  setReasonCanon: (v: string) => void;

  // 关联单据（ref）
  ref: string;
  setRef: (v: string) => void;

  // 追溯号（trace_id）
  traceId: string;
  setTraceId: (v: string) => void;

  // 日期范围（最终写回 time_from / time_to 的 ISO）
  timeFrom: string;
  setTimeFrom: (v: string) => void;
  timeTo: string;
  setTimeTo: (v: string) => void;

  onQuery: () => void;
  onClear: () => void;
};

const CANON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "不限" },
  { value: "RECEIPT", label: "入库" },
  { value: "SHIPMENT", label: "出库" },
  { value: "ADJUSTMENT", label: "调整 / 盘点" },
];

const SUB_REASON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "不限" },
  { value: "PO_RECEIPT", label: "采购入库" },
  { value: "ORDER_SHIP", label: "订单出库" },
  { value: "COUNT_ADJUST", label: "盘点确认" },
  { value: "RETURN_RECEIPT", label: "退货入库" },
  { value: "INTERNAL_SHIP", label: "内部出库" },
  { value: "RETURN_TO_VENDOR", label: "退供应商出库" },
];

function isoToDateOnly(iso: string): string {
  const x = (iso ?? "").trim();
  if (!x) return "";
  const m = x.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function dateOnlyToIsoStartZ(dateOnly: string): string {
  return `${dateOnly}T00:00:00Z`;
}

function dateOnlyToIsoEndZ(dateOnly: string): string {
  return `${dateOnly}T23:59:59Z`;
}

export const LedgerFiltersPanel: React.FC<Props> = (p) => {
  // 是否启用“日期范围”
  const [useDateRange, setUseDateRange] = useState(false);

  // 日期选择器 UI 值（YYYY-MM-DD）
  const [dateFrom, setDateFrom] = useState<string>(() => isoToDateOnly(p.timeFrom));
  const [dateTo, setDateTo] = useState<string>(() => isoToDateOnly(p.timeTo));

  // 外部 timeFrom/timeTo 变化时同步 UI
  useEffect(() => {
    setDateFrom(isoToDateOnly(p.timeFrom));
  }, [p.timeFrom]);

  useEffect(() => {
    setDateTo(isoToDateOnly(p.timeTo));
  }, [p.timeTo]);

  // 如果一开始就带了 time_from/time_to，自动打开日期范围
  useEffect(() => {
    const hasDate = Boolean((p.timeFrom ?? "").trim() || (p.timeTo ?? "").trim());
    if (hasDate) setUseDateRange(true);
  }, [p.timeFrom, p.timeTo]);

  const toggleDateRange = (checked: boolean) => {
    setUseDateRange(checked);
    if (!checked) {
      setDateFrom("");
      setDateTo("");
      p.setTimeFrom("");
      p.setTimeTo("");
    }
  };

  const onPickDateFrom = (v: string) => {
    setDateFrom(v);
    if (!useDateRange) setUseDateRange(true);
    if (!v) {
      p.setTimeFrom("");
      return;
    }
    p.setTimeFrom(dateOnlyToIsoStartZ(v));
  };

  const onPickDateTo = (v: string) => {
    setDateTo(v);
    if (!useDateRange) setUseDateRange(true);
    if (!v) {
      p.setTimeTo("");
      return;
    }
    p.setTimeTo(dateOnlyToIsoEndZ(v));
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    p.setTimeFrom("");
    p.setTimeTo("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm text-slate-700">
          仓库
          <input
            value={p.warehouseId}
            onChange={(e) => p.setWarehouseId(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="仓库ID（例如：1）"
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
          商品关键词
          <input
            value={p.itemKeyword}
            onChange={(e) => p.setItemKeyword(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="商品名 / SKU"
          />
        </label>

        <label className="text-sm text-slate-700">
          关联单据（精确）
          <input
            value={p.ref}
            onChange={(e) => p.setRef(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="RT-xxx / CNT:xxx / PDD:1:xxx"
          />
        </label>

        <label className="text-sm text-slate-700">
          追溯号（精确）
          <input
            value={p.traceId}
            onChange={(e) => p.setTraceId(e.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
            placeholder="用于精确追溯一次动作"
          />
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={useDateRange}
            onChange={(e) => toggleDateRange(e.target.checked)}
          />
          使用日期范围（开启后会覆盖上方“最近7/30/90天”）
        </label>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className={`text-sm ${useDateRange ? "text-slate-700" : "text-slate-400"}`}>
            开始日期
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onPickDateFrom(e.target.value)}
              disabled={!useDateRange}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:opacity-60"
            />
          </label>

          <label className={`text-sm ${useDateRange ? "text-slate-700" : "text-slate-400"}`}>
            结束日期
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onPickDateTo(e.target.value)}
              disabled={!useDateRange}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm disabled:opacity-60"
            />
          </label>

          <div className="flex items-end">
            <button
              type="button"
              disabled={!useDateRange || p.loading}
              onClick={clearDates}
              className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              清空日期
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={p.loading}
          onClick={p.onQuery}
          className="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {p.loading ? "查询中…" : "查询台账"}
        </button>

        <button
          type="button"
          disabled={p.loading}
          onClick={p.onClear}
          className="inline-flex h-9 items-center rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60"
        >
          清空筛选
        </button>
      </div>
    </div>
  );
};
