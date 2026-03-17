// src/features/tms/records/components/ShippingLedgerPagination.tsx

import React from "react";

interface ShippingLedgerPaginationProps {
  total: number;
  limit: number;
  offset: number;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const ShippingLedgerPagination: React.FC<ShippingLedgerPaginationProps> = ({
  total,
  limit,
  offset,
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => {
  const canPrev = offset > 0;
  const canNext = offset + limit < total;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          第 {currentPage} 页 / 共 {totalPages || 1} 页，合计 {total} 条
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onPrev}
            disabled={!canPrev}
          >
            上一页
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onNext}
            disabled={!canNext}
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShippingLedgerPagination;
