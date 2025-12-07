// src/features/diagnostics/stock-tool/StockToolPage.tsx
import React, { useEffect, useState } from "react";
import { apiPost } from "../../../lib/api";
import { downloadCSV, toCSV } from "../../../lib/csv";
import { StockToolFilters } from "./StockToolFilters";
import { StockBatchTableCard } from "./StockBatchTableCard";
import type { StockBatchQueryOut } from "./types";
import { BATCH_PAGE_SIZE } from "./types";

type Props = {
  initialWarehouseId?: number;
  initialItemId?: number;
  initialBatchCode?: string;
};

type StockBatchQueryPayloadInput = {
  item_id: number;
  page: number;
  page_size: number;
  warehouse_id?: number;
};

const StockToolPage: React.FC<Props> = ({
  initialWarehouseId,
  initialItemId,
  initialBatchCode,
}) => {
  // 注意：这里不再从 useSearchParams 读 URL，
  // URL 已由 InventoryStudio 中控解析并通过 props 传入。

  const [itemId, setItemId] = useState(
    initialItemId !== undefined ? String(initialItemId) : "",
  );
  const [warehouseId, setWarehouseId] = useState(
    initialWarehouseId !== undefined ? String(initialWarehouseId) : "",
  );
  const [batchCodeCtx, setBatchCodeCtx] = useState(
    initialBatchCode ?? "",
  );

  const [result, setResult] = useState<StockBatchQueryOut | null>(null);
  const [loading, setLoading] = useState(false);

  async function queryBatches(
    overrides?: { itemId?: string; warehouseId?: string },
  ) {
    const effectiveItemId = (overrides?.itemId ?? itemId).trim();
    const effectiveWarehouseId = (overrides?.warehouseId ?? warehouseId).trim();

    if (!effectiveItemId) {
      setResult(null);
      return;
    }

    const payload: StockBatchQueryPayloadInput = {
      item_id: Number(effectiveItemId),
      page: 1,
      page_size: BATCH_PAGE_SIZE,
    };
    if (effectiveWarehouseId) {
      payload.warehouse_id = Number(effectiveWarehouseId);
    }

    setLoading(true);
    try {
      const res = await apiPost<StockBatchQueryOut>(
        "/stock/batch/query",
        payload,
      );
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  // 当初始 props 发生变化时（例如从 Dashboard 点击链接进入），自动加载一次
  useEffect(() => {
    if (initialItemId !== undefined) {
      const iid = String(initialItemId);
      const wid =
        initialWarehouseId !== undefined
          ? String(initialWarehouseId)
          : warehouseId;

      setItemId(iid);
      if (initialWarehouseId !== undefined) {
        setWarehouseId(wid);
      }
      if (initialBatchCode) {
        setBatchCodeCtx(initialBatchCode);
      }

      void queryBatches({ itemId: iid, warehouseId: wid });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItemId, initialWarehouseId, initialBatchCode]);

  function exportCSV() {
    if (!result) return;
    const csv = toCSV(result.items || []);
    downloadCSV(
      csv,
      `stock_batches_item_${itemId || "all"}_wh_${warehouseId || "all"}.csv`,
    );
  }

  const total = result?.total ?? 0;
  const totalQty = (result?.items ?? []).reduce(
    (acc, r) => acc + (r.qty || 0),
    0,
  );

  return (
    <div className="w-full px-6 lg:px-10">
      {/* 整页高度撑满视窗，避免内容挤在上半截 */}
      <div className="mx-auto w-full flex flex-col gap-8 min-h-[calc(100vh-140px)]">
        <StockToolFilters
          itemId={itemId}
          warehouseId={warehouseId}
          batchCodeCtx={batchCodeCtx}
          loading={loading}
          onChangeItemId={setItemId}
          onChangeWarehouseId={setWarehouseId}
          onChangeBatchCodeCtx={setBatchCodeCtx}
          onSubmit={() => queryBatches()}
        />

        <StockBatchTableCard
          total={total}
          totalQty={totalQty}
          rows={result?.items ?? []}
          focusBatchCode={batchCodeCtx || undefined}
          onExport={exportCSV}
        />
      </div>
    </div>
  );
};

export default StockToolPage;
