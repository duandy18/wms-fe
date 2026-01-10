// src/features/inventory/ledger/StockLedgerPage.tsx
import React from "react";
import PageTitle from "../../../components/ui/PageTitle";
import { useStockLedgerModel } from "./useStockLedgerModel";

import { LedgerHintBanner } from "./components/LedgerHintBanner";
import { LedgerRangeBar } from "./components/LedgerRangeBar";
import { LedgerFiltersPanel } from "./components/LedgerFiltersPanel";
import { LedgerTable } from "./components/LedgerTable";
import { LedgerPager } from "./components/LedgerPager";

export default function StockLedgerPage() {
  const m = useStockLedgerModel();

  return (
    <div className="space-y-4">
      <PageTitle title="库存台账" />

      <LedgerHintBanner
        hint={m.hint}
        hasHint={m.hasHint}
        onApply={m.applyHintToForm}
        onClear={m.clearUrlHint}
      />

      {/* 保留三个日期按钮，但不再包一张卡 */}
      <LedgerRangeBar loading={m.loading} pageSize={m.pageSize} onPick={m.applyRange} />

      <LedgerFiltersPanel
        loading={m.loading}
        warehouseId={m.warehouseId}
        setWarehouseId={m.setWarehouseId}
        itemKeyword={m.itemKeyword}
        setItemKeyword={m.setItemKeyword}
        subReason={m.subReason}
        setSubReason={m.setSubReason}
        reasonCanon={m.reasonCanon}
        setReasonCanon={m.setReasonCanon}
        ref={m.ref}
        setRef={m.setRef}
        traceId={m.traceId}
        setTraceId={m.setTraceId}
        timeFrom={m.timeFrom}
        setTimeFrom={m.setTimeFrom}
        timeTo={m.timeTo}
        setTimeTo={m.setTimeTo}
        onQuery={() => void m.runQuery(0)}
        onClear={m.clearForm}
      />

      {m.error ? (
        <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">{m.error}</div>
      ) : null}

      <LedgerTable loading={m.loading} rows={m.rows} />

      <LedgerPager
        loading={m.loading}
        rowsLen={m.rows.length}
        total={m.total}
        pageSize={m.pageSize}
        offset={m.offset}
        canPrev={m.canPrev}
        canNext={m.canNext}
        onPrev={() => void m.runQuery(Math.max(0, m.offset - m.pageSize))}
        onNext={() => void m.runQuery(m.offset + m.pageSize)}
      />
    </div>
  );
}
