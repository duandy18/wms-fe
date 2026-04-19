import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchManualOutboundDoc,
  fetchManualOutboundDocs,
} from "../api/outboundApi";
import type { ManualOutboundDocOut } from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type QtyMap = Record<number, string>;
type BarcodeMap = Record<number, string>;
type LineHintMap = Record<number, string>;

function buildDefaultLineHint(): string {
  return "等待扫码识别；下一轮在这里接入命中的 lot / 批次 / 日期信息。";
}

export function useOutboundManualPage() {
  const [rows, setRows] = useState<ManualOutboundDocOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [selectedDocId, setSelectedDocId] = useState("");
  const [detail, setDetail] = useState<ManualOutboundDocOut | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [qtyByLineId, setQtyByLineId] = useState<QtyMap>({});
  const [barcodeByLineId, setBarcodeByLineId] = useState<BarcodeMap>({});
  const [lineHintByLineId, setLineHintByLineId] = useState<LineHintMap>({});
  const [submitMessage, setSubmitMessage] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchManualOutboundDocs({ limit: 50, offset: 0 });
      const releasedOnly = (Array.isArray(data) ? data : []).filter(
        (item) => item.status === "RELEASED",
      );
      setRows(releasedOnly);
    } catch (error) {
      setRows([]);
      setError(getErrorMessage(error, "加载已发布手动出库单据失败"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows, reloadToken]);

  const loadDetail = useCallback(async (docId: number) => {
    setDetailLoading(true);
    setDetailError("");
    setSubmitMessage("");
    try {
      const data = await fetchManualOutboundDoc(docId);
      setDetail(data);

      const nextQtyByLineId: QtyMap = {};
      const nextBarcodeByLineId: BarcodeMap = {};
      const nextLineHintByLineId: LineHintMap = {};

      for (const line of data.lines) {
        nextQtyByLineId[line.id] = "";
        nextBarcodeByLineId[line.id] = "";
        nextLineHintByLineId[line.id] = buildDefaultLineHint();
      }

      setQtyByLineId(nextQtyByLineId);
      setBarcodeByLineId(nextBarcodeByLineId);
      setLineHintByLineId(nextLineHintByLineId);
    } catch (error) {
      setDetail(null);
      setQtyByLineId({});
      setBarcodeByLineId({});
      setLineHintByLineId({});
      setDetailError(getErrorMessage(error, "加载手动出库详情失败"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const selectDocId = useCallback(
    (next: string) => {
      setSelectedDocId(next);
      const id = Number(next);
      if (!Number.isFinite(id) || id <= 0) {
        setDetail(null);
        setQtyByLineId({});
        setBarcodeByLineId({});
        setLineHintByLineId({});
        setDetailError("");
        return;
      }
      void loadDetail(id);
    },
    [loadDetail],
  );

  const updateQty = useCallback((lineId: number, value: string) => {
    setQtyByLineId((prev) => ({ ...prev, [lineId]: value }));
  }, []);

  const updateBarcode = useCallback((lineId: number, value: string) => {
    setBarcodeByLineId((prev) => ({ ...prev, [lineId]: value }));
  }, []);

  const resolveBarcodePlaceholder = useCallback((lineId: number) => {
    const barcode = (barcodeByLineId[lineId] || "").trim();
    if (!barcode) {
      setLineHintByLineId((prev) => ({
        ...prev,
        [lineId]: "请先输入或扫码条码，再进行识别。",
      }));
      return;
    }

    setLineHintByLineId((prev) => ({
      ...prev,
      [lineId]: `已记录条码 ${barcode}；下一轮在这里接扫码命中结果与 lot 信息。`,
    }));
  }, [barcodeByLineId]);

  const enteredLinesCount = useMemo(() => {
    return Object.values(qtyByLineId).filter((value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0;
    }).length;
  }, [qtyByLineId]);

  const handleSubmitPlaceholder = useCallback(() => {
    if (!detail) {
      setSubmitMessage("请先选择已发布手动出库单据。");
      return;
    }
    if (enteredLinesCount <= 0) {
      setSubmitMessage("请至少录入一条本次出库数量。");
      return;
    }
    setSubmitMessage(
      "当前页已完成已发布单据读取、扫码框与录数结构；扫码命中 lot / 提交合同这一步下一轮继续接。",
    );
  }, [detail, enteredLinesCount]);

  return {
    rows,
    loading,
    error,
    reload: () => setReloadToken((v) => v + 1),

    selectedDocId,
    selectDocId,
    detail,
    detailLoading,
    detailError,

    qtyByLineId,
    barcodeByLineId,
    lineHintByLineId,
    updateQty,
    updateBarcode,
    resolveBarcodePlaceholder,
    enteredLinesCount,

    submitMessage,
    handleSubmitPlaceholder,
    reloadDetail: () => {
      const id = Number(selectedDocId);
      if (Number.isFinite(id) && id > 0) {
        void loadDetail(id);
      }
    },
  };
}
