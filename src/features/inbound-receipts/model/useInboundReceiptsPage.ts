import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchInboundReceipts,
  releaseInboundReceipt,
} from "../api/inboundReceiptsApi";
import type {
  InboundReceiptListItemOut,
  InboundReceiptSourceType,
} from "../contracts/inboundReceipt";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function useInboundReceiptsPage(sourceType?: InboundReceiptSourceType) {
  const [rowsRaw, setRowsRaw] = useState<InboundReceiptListItemOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInboundReceipts();
      setRowsRaw(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setRowsRaw([]);
      setError(getErrorMessage(err, "加载入库单列表失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const rows = useMemo(() => {
    if (!sourceType) return rowsRaw;
    return rowsRaw.filter((row) => row.source_type === sourceType);
  }, [rowsRaw, sourceType]);

  const reload = useCallback(() => {
    setReloadToken((v) => v + 1);
  }, []);

  const release = useCallback(async (receiptId: number) => {
    setReleasingId(receiptId);
    setError("");
    try {
      await releaseInboundReceipt(receiptId);
      setReloadToken((v) => v + 1);
    } catch (err) {
      setError(getErrorMessage(err, "发布入库单失败"));
    } finally {
      setReleasingId(null);
    }
  }, []);

  return {
    rows,
    loading,
    error,
    releasingId,
    reload,
    release,
  };
}
