import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPmsExportUom } from "../../../../domains/pms/export";
import {
  fetchBarcodeProbe,
  fetchManualOutboundDoc,
  fetchManualOutboundDocs,
  fetchOutboundLotCandidates,
  submitManualOutbound,
} from "../api/outboundApi";
import type {
  ManualOutboundDocOut,
  OutboundLotCandidateOut,
} from "../contracts/outbound";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

type QtyMap = Record<number, string>;
type BarcodeMap = Record<number, string>;
type LineHintMap = Record<number, string>;
type LotCandidatesMap = Record<number, OutboundLotCandidateOut[]>;
type SelectedLotMap = Record<number, OutboundLotCandidateOut>;

export interface ResolvedManualOutboundLineInfo {
  itemId: number;
  itemSku: string | null;
  itemName: string | null;
  itemSpec: string | null;
  uomId: number | null;
  uomName: string | null;
  ratioToBase: number | null;
  barcode: string;
}

function buildDefaultLineHint(): string {
  return "上行看单据行参考，下行填实现；扫码后读取当前单据仓库下的可用 lot。";
}

function clearLineMaps(
  setQtyByLineId: React.Dispatch<React.SetStateAction<QtyMap>>,
  setBarcodeByLineId: React.Dispatch<React.SetStateAction<BarcodeMap>>,
  setLineHintByLineId: React.Dispatch<React.SetStateAction<LineHintMap>>,
  setResolvedByLineId: React.Dispatch<
    React.SetStateAction<Record<number, ResolvedManualOutboundLineInfo>>
  >,
  setLotCandidatesByLineId: React.Dispatch<
    React.SetStateAction<LotCandidatesMap>
  >,
  setSelectedLotByLineId: React.Dispatch<
    React.SetStateAction<SelectedLotMap>
  >,
) {
  setQtyByLineId({});
  setBarcodeByLineId({});
  setLineHintByLineId({});
  setResolvedByLineId({});
  setLotCandidatesByLineId({});
  setSelectedLotByLineId({});
}

function formatLotLabel(candidate: OutboundLotCandidateOut): string {
  if (candidate.lot_code && candidate.lot_code.trim()) {
    return candidate.lot_code.trim();
  }
  return `内部 lot #${candidate.lot_id}`;
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
  const [resolvedByLineId, setResolvedByLineId] = useState<
    Record<number, ResolvedManualOutboundLineInfo>
  >({});
  const [lotCandidatesByLineId, setLotCandidatesByLineId] =
    useState<LotCandidatesMap>({});
  const [selectedLotByLineId, setSelectedLotByLineId] =
    useState<SelectedLotMap>({});
  const [resolvingLineId, setResolvingLineId] = useState<number | null>(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (!selectedDocId) return;
    const hit = rows.find((item) => String(item.id) === selectedDocId);
    if (hit) return;

    setSelectedDocId("");
    setDetail(null);
    setDetailError("");
    setQtyByLineId({});
    setBarcodeByLineId({});
    setLineHintByLineId({});
    setResolvedByLineId({});
    setLotCandidatesByLineId({});
    setSelectedLotByLineId({});
    setResolvingLineId(null);
    setSubmitMessage("");
  }, [rows, selectedDocId]);

  const loadDetail = useCallback(async (docId: number) => {
    setDetailLoading(true);
    setDetailError("");
    setSubmitMessage("");
    setResolvingLineId(null);

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
      setResolvedByLineId({});
      setLotCandidatesByLineId({});
      setSelectedLotByLineId({});
    } catch (error) {
      setDetail(null);
      clearLineMaps(
        setQtyByLineId,
        setBarcodeByLineId,
        setLineHintByLineId,
        setResolvedByLineId,
        setLotCandidatesByLineId,
        setSelectedLotByLineId,
      );
      setDetailError(getErrorMessage(error, "加载手动出库详情失败"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const selectDocId = useCallback(
    (next: string) => {
      setSelectedDocId(next);
      setSubmitMessage("");
      setResolvingLineId(null);

      const id = Number(next);
      if (!Number.isFinite(id) || id <= 0) {
        setDetail(null);
        clearLineMaps(
          setQtyByLineId,
          setBarcodeByLineId,
          setLineHintByLineId,
          setResolvedByLineId,
          setLotCandidatesByLineId,
          setSelectedLotByLineId,
        );
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

  const resolveBarcode = useCallback(
    async (lineId: number) => {
      const line = detail?.lines.find((item) => item.id === lineId);
      if (!line || !detail) return;

      const barcode = (barcodeByLineId[lineId] || "").trim();
      if (!barcode) {
        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: "请先在本行输入或扫码条码，再进行识别。",
        }));
        return;
      }

      setResolvingLineId(lineId);

      try {
        const probe = await fetchBarcodeProbe(barcode);

        if (probe.ok !== true || probe.status !== "BOUND" || !probe.item_id) {
          setResolvedByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLotCandidatesByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setSelectedLotByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: "未识别到有效商品条码，请检查条码绑定。",
          }));
          return;
        }

        if (probe.item_id !== line.item_id) {
          setResolvedByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLotCandidatesByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setSelectedLotByLineId((prev) => {
            const next = { ...prev };
            delete next[lineId];
            return next;
          });
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: `条码已识别为商品 ${probe.item_basic?.name || probe.item_id}，与单据行商品不一致。`,
          }));
          return;
        }

        let uomName: string | null = line.uom_name_snapshot || null;
        if (probe.item_uom_id != null) {
          try {
            const matchedUom = await fetchPmsExportUom(probe.item_uom_id);
            uomName =
              matchedUom.uom_name ||
              matchedUom.display_name ||
              matchedUom.uom ||
              line.uom_name_snapshot ||
              null;
          } catch {
            uomName = line.uom_name_snapshot || null;
          }
        }

        const resolved: ResolvedManualOutboundLineInfo = {
          itemId: probe.item_id,
          itemSku: probe.item_basic?.sku || line.item_sku_snapshot || null,
          itemName: probe.item_basic?.name || line.item_name_snapshot || null,
          itemSpec: probe.item_basic?.spec || line.item_spec_snapshot || null,
          uomId: probe.item_uom_id ?? line.item_uom_id ?? null,
          uomName,
          ratioToBase: probe.ratio_to_base ?? null,
          barcode,
        };

        setResolvedByLineId((prev) => ({
          ...prev,
          [lineId]: resolved,
        }));

        const lotResp = await fetchOutboundLotCandidates(
          detail.warehouse_id,
          probe.item_id,
        );
        const candidates = Array.isArray(lotResp.candidates)
          ? lotResp.candidates
          : [];

        setLotCandidatesByLineId((prev) => ({
          ...prev,
          [lineId]: candidates,
        }));
        setSelectedLotByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });

        if (candidates.length <= 0) {
          setLineHintByLineId((prev) => ({
            ...prev,
            [lineId]: "已识别商品与单据行一致，但当前单据仓库暂无可用 lot。",
          }));
          return;
        }

        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: `已识别商品与单据行一致；当前单据仓库共有 ${candidates.length} 个可用 lot，请选择。`,
        }));
      } catch (error) {
        setResolvedByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setLotCandidatesByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setSelectedLotByLineId((prev) => {
          const next = { ...prev };
          delete next[lineId];
          return next;
        });
        setLineHintByLineId((prev) => ({
          ...prev,
          [lineId]: getErrorMessage(error, "条码识别失败"),
        }));
      } finally {
        setResolvingLineId(null);
      }
    },
    [barcodeByLineId, detail],
  );

  const selectLot = useCallback(
    (lineId: number, lotId: number) => {
      const candidates = lotCandidatesByLineId[lineId] ?? [];
      const matched = candidates.find((item) => item.lot_id === lotId) ?? null;
      if (!matched) return;

      setSelectedLotByLineId((prev) => ({
        ...prev,
        [lineId]: matched,
      }));

      setLineHintByLineId((prev) => ({
        ...prev,
        [lineId]: `已选择 ${formatLotLabel(matched)}；可出数量 ${matched.available_qty}。下一步录入本次出库数量并提交。`,
      }));
    },
    [lotCandidatesByLineId],
  );

  const enteredLinesCount = useMemo(() => {
    return Object.values(qtyByLineId).filter((value) => {
      const qty = Number(value);
      return Number.isFinite(qty) && qty > 0;
    }).length;
  }, [qtyByLineId]);

  const canSubmit = useMemo(() => {
    if (!detail || isSubmitting) return false;

    const qtyLines = detail.lines.filter((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      return Number.isFinite(qty) && qty > 0;
    });
    if (qtyLines.length <= 0) return false;

    return qtyLines.every((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      const selectedLot = selectedLotByLineId[line.id];
      const resolved = resolvedByLineId[line.id];
      if (!resolved || !selectedLot) return false;
      return qty <= Number(selectedLot.available_qty ?? 0);
    });
  }, [
    detail,
    isSubmitting,
    qtyByLineId,
    resolvedByLineId,
    selectedLotByLineId,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!detail) {
      setSubmitMessage("请先选择已发布手动出库单据。");
      return;
    }

    const invalidQtyLine = detail.lines.find((line) => {
      const raw = (qtyByLineId[line.id] || "").trim();
      if (!raw) return false;
      const qty = Number(raw);
      return !(Number.isFinite(qty) && Number.isInteger(qty) && qty >= 0);
    });
    if (invalidQtyLine) {
      setSubmitMessage(`第 ${invalidQtyLine.line_no} 行数量不合法，请输入非负整数。`);
      return;
    }

    const qtyLines = detail.lines.filter((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      return Number.isFinite(qty) && qty > 0;
    });

    if (qtyLines.length <= 0) {
      setSubmitMessage("请至少录入一条本次出库数量。");
      return;
    }

    const unresolvedLine = qtyLines.find((line) => !resolvedByLineId[line.id]);
    if (unresolvedLine) {
      setSubmitMessage(`第 ${unresolvedLine.line_no} 行尚未完成条码识别。`);
      return;
    }

    const unselectedLotLine = qtyLines.find((line) => !selectedLotByLineId[line.id]);
    if (unselectedLotLine) {
      setSubmitMessage(`第 ${unselectedLotLine.line_no} 行尚未选择 lot。`);
      return;
    }

    const overAvailableLine = qtyLines.find((line) => {
      const qty = Number(qtyByLineId[line.id] || "0");
      const selectedLot = selectedLotByLineId[line.id];
      return qty > (selectedLot?.available_qty ?? 0);
    });
    if (overAvailableLine) {
      setSubmitMessage(`第 ${overAvailableLine.line_no} 行出库数量超过已选 lot 可出数量。`);
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        lines: qtyLines.map((line) => {
          const selectedLot = selectedLotByLineId[line.id];
          return {
            manual_doc_line_id: line.id,
            item_id: line.item_id,
            qty_outbound: Number(qtyByLineId[line.id] || "0"),
            lot_id: selectedLot.lot_id,
            remark: null,
          };
        }),
      };

      const result = await submitManualOutbound(detail.id, payload);

      const nextQtyByLineId: QtyMap = {};
      const nextBarcodeByLineId: BarcodeMap = {};
      const nextLineHintByLineId: LineHintMap = {};
      for (const line of detail.lines) {
        nextQtyByLineId[line.id] = "";
        nextBarcodeByLineId[line.id] = "";
        nextLineHintByLineId[line.id] = buildDefaultLineHint();
      }

      setQtyByLineId(nextQtyByLineId);
      setBarcodeByLineId(nextBarcodeByLineId);
      setLineHintByLineId(nextLineHintByLineId);
      setResolvedByLineId({});
      setLotCandidatesByLineId({});
      setSelectedLotByLineId({});
      setSubmitMessage(
        `提交成功：已生成出库事件 ${result.event_id}，共 ${result.lines_count} 行。`,
      );
      void loadRows();
    } catch (error) {
      setSubmitMessage(getErrorMessage(error, "提交手动出库失败"));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    detail,
    loadRows,
    qtyByLineId,
    resolvedByLineId,
    selectedLotByLineId,
  ]);

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
    resolvedByLineId,
    lotCandidatesByLineId,
    selectedLotByLineId,
    resolvingLineId,
    updateQty,
    updateBarcode,
    resolveBarcode,
    selectLot,
    enteredLinesCount,
    canSubmit,
    isSubmitting,

    submitMessage,
    handleSubmit,
    reloadDetail: () => {
      const id = Number(selectedDocId);
      if (Number.isFinite(id) && id > 0) {
        void loadDetail(id);
      }
    },
  };
}
