import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchReceivingTask,
  fetchReceivingTasks,
} from "../api/receivingApi";
import type {
  ReceivingTaskListItemOut,
  ReceivingTaskReadOut,
  ReceivingSourceType,
} from "../contracts/receiving";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type DetailMap = Record<string, ReceivingTaskReadOut | undefined>;
type DetailLoadingMap = Record<string, boolean>;
type DetailErrorMap = Record<string, string>;

export function useReceivingSummaryPage(sourceType?: ReceivingSourceType) {
  const [rowsRaw, setRowsRaw] = useState<ReceivingTaskListItemOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [expandedReceiptNo, setExpandedReceiptNo] = useState<string | null>(null);
  const [detailByReceiptNo, setDetailByReceiptNo] = useState<DetailMap>({});
  const [detailLoadingByReceiptNo, setDetailLoadingByReceiptNo] = useState<DetailLoadingMap>({});
  const [detailErrorByReceiptNo, setDetailErrorByReceiptNo] = useState<DetailErrorMap>({});

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReceivingTasks();
      setRowsRaw(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setRowsRaw([]);
      setError(getErrorMessage(err, "加载收货汇总失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, reloadToken]);

  const rows = useMemo(() => {
    if (!sourceType) return rowsRaw;
    return rowsRaw.filter((row) => row.source_type === sourceType);
  }, [rowsRaw, sourceType]);

  const loadDetail = useCallback(
    async (receiptNo: string, force = false) => {
      if (!receiptNo.trim()) return;

      if (!force) {
        if (detailByReceiptNo[receiptNo] || detailLoadingByReceiptNo[receiptNo]) {
          return;
        }
      }

      setDetailLoadingByReceiptNo((prev) => ({ ...prev, [receiptNo]: true }));
      setDetailErrorByReceiptNo((prev) => ({ ...prev, [receiptNo]: "" }));

      try {
        const detail = await fetchReceivingTask(receiptNo);
        setDetailByReceiptNo((prev) => ({ ...prev, [receiptNo]: detail }));
      } catch (err) {
        setDetailErrorByReceiptNo((prev) => ({
          ...prev,
          [receiptNo]: getErrorMessage(err, "加载当前收货情况失败"),
        }));
      } finally {
        setDetailLoadingByReceiptNo((prev) => ({ ...prev, [receiptNo]: false }));
      }
    },
    [detailByReceiptNo, detailLoadingByReceiptNo],
  );

  const toggleExpand = useCallback(
    async (receiptNo: string) => {
      if (expandedReceiptNo === receiptNo) {
        setExpandedReceiptNo(null);
        return;
      }

      setExpandedReceiptNo(receiptNo);
      await loadDetail(receiptNo, false);
    },
    [expandedReceiptNo, loadDetail],
  );

  return {
    rows,
    loading,
    error,
    reload: () => setReloadToken((v) => v + 1),
    expandedReceiptNo,
    detailByReceiptNo,
    detailLoadingByReceiptNo,
    detailErrorByReceiptNo,
    toggleExpand,
    refreshDetail: async (receiptNo: string) => {
      await loadDetail(receiptNo, true);
    },
  };
}
