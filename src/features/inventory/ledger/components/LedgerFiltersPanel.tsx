// src/features/inventory/ledger/components/LedgerFiltersPanel.tsx
import React, { useEffect, useMemo, useState } from "react";

import { fetchActiveWarehouses, fetchItems, type ItemOut, type WarehouseOut } from "./filters/api";
import { isoToDateOnly, dateOnlyToIsoEndZ, dateOnlyToIsoStartZ } from "./filters/dateRange";
import { applyIdFromInput, useWarehouseDisplayValue, useItemDisplayValue } from "./filters/selectorUtils";

import { fetchLedgerEnums, buildCanonOptions, buildSubReasonOptions, type Option } from "./filters/options";

import { LedgerFiltersHeader } from "./LedgerFiltersHeader";
import { LedgerFiltersBody } from "./LedgerFiltersBody";

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

  // ✅ 历史查询模式灰字说明（needHistory 为 true 时给）
  historyModeNote?: string | null;

  // ✅ 历史查询错误提示（缺锚点/超范围等；需与后端 1:1）
  historyHint?: string | null;
};

export const LedgerFiltersPanel: React.FC<Props> = (p) => {
  const [collapsed, setCollapsed] = useState(false);

  const [warehouses, setWarehouses] = useState<WarehouseOut[]>([]);
  const [items, setItems] = useState<ItemOut[]>([]);
  const [optsErr, setOptsErr] = useState<string | null>(null);

  // enums -> options
  const [canonOptions, setCanonOptions] = useState<Option[]>([{ value: "", label: "不限" }]);
  const [subReasonOptions, setSubReasonOptions] = useState<Option[]>([{ value: "", label: "不限" }]);

  // 日期范围（可选）
  const [useDateRange, setUseDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>(() => isoToDateOnly(p.timeFrom));
  const [dateTo, setDateTo] = useState<string>(() => isoToDateOnly(p.timeTo));

  useEffect(() => {
    let alive = true;

    async function load() {
      setOptsErr(null);
      try {
        const [w, i, enums] = await Promise.all([fetchActiveWarehouses(), fetchItems(), fetchLedgerEnums()]);
        if (!alive) return;

        setWarehouses(w);
        setItems(i);

        setCanonOptions(buildCanonOptions(enums.reason_canons));
        setSubReasonOptions(buildSubReasonOptions(enums.sub_reasons));
      } catch (e) {
        if (!alive) return;
        setWarehouses([]);
        setItems([]);
        setCanonOptions([{ value: "", label: "不限" }]);
        setSubReasonOptions([{ value: "", label: "不限" }]);
        setOptsErr(e instanceof Error ? e.message : "加载筛选项失败");
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  // 外部时间有值时，自动开启日期范围
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
      <LedgerFiltersHeader
        summary={summary}
        loading={p.loading}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onQuery={p.onQuery}
        onClear={p.onClear}
      />

      {optsErr ? <div className="px-4 pt-3 text-xs text-rose-700">{optsErr}</div> : null}

      {collapsed ? null : (
        <LedgerFiltersBody
          loading={p.loading}
          warehouses={warehouses}
          items={items}
          whListId={whListId}
          itemListId={itemListId}
          warehouseDisplay={whDisplay}
          itemDisplay={itemDisplay}
          onWarehouseInput={(raw) => applyIdFromInput(raw, p.setWarehouseId)}
          onItemInput={(raw) => applyIdFromInput(raw, p.setItemId)}
          subReason={p.subReason}
          setSubReason={p.setSubReason}
          reasonCanon={p.reasonCanon}
          setReasonCanon={p.setReasonCanon}
          canonOptions={canonOptions}
          subReasonOptions={subReasonOptions}
          ref={p.ref}
          setRef={p.setRef}
          traceId={p.traceId}
          setTraceId={p.setTraceId}
          useDateRange={useDateRange}
          setUseDateRange={setUseDateRange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onPickDateFrom={onPickDateFrom}
          onPickDateTo={onPickDateTo}
          onClearDates={clearDates}
          historyModeNote={p.historyModeNote ?? null}
          historyHint={p.historyHint ?? null}
        />
      )}
    </section>
  );
};
