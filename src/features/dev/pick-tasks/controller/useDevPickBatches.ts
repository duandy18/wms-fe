// src/features/dev/pick-tasks/controller/useDevPickBatches.ts
import { useEffect, useMemo, useState } from "react";
import { apiPost } from "../../../../lib/api";
import type { StockBatchRow, StockBatchQueryOut } from "../types";
import { getErrorMessage } from "../types";

export function useDevPickBatches(args: { activeWarehouseId: number | null; activeItemId: number | null }) {
  const { activeWarehouseId, activeItemId } = args;

  const [batchRows, setBatchRows] = useState<StockBatchRow[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState<string | null>(null);

  const recommendedBatchCode = useMemo(() => (batchRows.length > 0 ? batchRows[0].batch_code ?? null : null), [batchRows]);

  useEffect(() => {
    async function loadBatches() {
      if (!activeWarehouseId || !activeItemId) {
        setBatchRows([]);
        setBatchesError(null);
        return;
      }

      setBatchesLoading(true);
      setBatchesError(null);

      try {
        const res = await apiPost<StockBatchQueryOut>("/stock/batch/query", {
          item_id: activeItemId,
          warehouse_id: activeWarehouseId,
          page: 1,
          page_size: 50,
        });

        setBatchRows(res.items ?? []);
      } catch (err: unknown) {
        console.error(err);
        setBatchesError(getErrorMessage(err) || "加载批次库存失败");
        setBatchRows([]);
      } finally {
        setBatchesLoading(false);
      }
    }

    void loadBatches();
  }, [activeWarehouseId, activeItemId]);

  return {
    batchRows,
    batchesLoading,
    batchesError,
    recommendedBatchCode,
    setBatchRows,
  };
}
