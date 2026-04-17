import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchInboundReceiptDetail,
  fetchInboundReceiptProgress,
  releaseInboundReceipt,
} from "../api/inboundReceiptsApi";
import type {
  InboundReceiptProgressLineOut,
  InboundReceiptReadOut,
} from "../contracts/inboundReceipt";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function useInboundReceiptDetailPage(receiptIdRaw: string | undefined) {
  const receiptId = Number(receiptIdRaw);
  const isValid = Number.isFinite(receiptId) && receiptId > 0;

  const [detail, setDetail] = useState<InboundReceiptReadOut | null>(null);
  const [progressLines, setProgressLines] = useState<InboundReceiptProgressLineOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [releasing, setReleasing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (!isValid) {
      setDetail(null);
      setProgressLines([]);
      setError("无效的入库单 ID。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [detailRes, progressRes] = await Promise.all([
        fetchInboundReceiptDetail(receiptId),
        fetchInboundReceiptProgress(receiptId),
      ]);
      setDetail(detailRes);
      setProgressLines(Array.isArray(progressRes.lines) ? progressRes.lines : []);
    } catch (err) {
      setDetail(null);
      setProgressLines([]);
      setError(getErrorMessage(err, "加载入库单详情失败"));
    } finally {
      setLoading(false);
    }
  }, [isValid, receiptId]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  const progressByLineNo = useMemo(() => {
    const map = new Map<number, InboundReceiptProgressLineOut>();
    for (const row of progressLines) {
      map.set(row.line_no, row);
    }
    return map;
  }, [progressLines]);

  const release = useCallback(async () => {
    if (!detail) return;
    setReleasing(true);
    setError("");
    try {
      await releaseInboundReceipt(detail.id);
      setReloadToken((v) => v + 1);
    } catch (err) {
      setError(getErrorMessage(err, "发布入库单失败"));
    } finally {
      setReleasing(false);
    }
  }, [detail]);

  return {
    receiptId,
    isValid,
    detail,
    progressByLineNo,
    loading,
    error,
    releasing,
    reload: () => setReloadToken((v) => v + 1),
    release,
  };
}
