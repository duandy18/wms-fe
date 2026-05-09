import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  fetchPmsExportUomsByItems,
  type PmsExportUom,
} from "../../../../domains/pms/export";
import {
  createInboundReceiptFromReturnOrder,
  fetchInboundReceiptDetail,
  fetchInboundReceiptProgress,
  fetchInboundReceiptReturnSource,
  releaseInboundReceipt,
  type InboundReceiptCreateFromReturnOrderLineIn,
} from "../../../inbound-receipts/api/inboundReceiptsApi";
import type {
  InboundReceiptProgressOut,
  InboundReceiptReadOut,
  InboundReceiptReturnSourceOut,
} from "../../../inbound-receipts/contracts/inboundReceipt";
import {
  fetchReceivingTask,
  probeReceivingTaskBarcode,
  submitReceiving,
} from "../../receiving/api/receivingApi";
import type {
  ReceivingActualUomOption,
  ReceivingEntryDraft,
  ReceivingLineIn,
  ReceivingSubmitIn,
  ReceivingSubmitOut,
  ReceivingTaskProbeOut,
  ReceivingTaskReadOut,
} from "../../receiving/contracts/receiving";
import {
  createEmptyReceivingEntryDraft,
  receivingLineRequiresBatchField,
  receivingLineShowsBatchField,
  receivingLineShowsDateFields,
} from "../../receiving/contracts/receiving";
import {
  BASE_EPSILON,
  applyResolvedScanToFixedRows,
  buildEmptyEntries,
  buildLineUomOptions,
  buildPresetEntriesFromUoms,
  formatQty,
  getErrorMessage,
  isEntryTouched,
  normalizeOptionalString,
  type ReceivingEntriesByLineNo,
  type ReceivingUomOptionsByLineNo,
} from "../../receiving/utils/fixedRows";
import {
  fetchReturnOrderRefDetail,
  fetchReturnOrderRefs,
} from "../api/returnInboundApi";
import type {
  ReturnOrderRefDetailOut,
  ReturnOrderRefItemOut,
} from "../contracts/returnInbound";

type QtyMap = Record<number, string>;
type SelectedMap = Record<number, boolean>;

export function useInventoryReturnInboundPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryOrderKey = (searchParams.get("order_key") ?? "").trim();

  const [orderRefs, setOrderRefs] = useState<ReturnOrderRefItemOut[]>([]);
  const [orderRefsLoading, setOrderRefsLoading] = useState(false);
  const [orderRefsError, setOrderRefsError] = useState("");

  const [selectedOrderRef, setSelectedOrderRef] = useState(queryOrderKey);
  const [orderDetail, setOrderDetail] = useState<ReturnOrderRefDetailOut | null>(null);
  const [source, setSource] = useState<InboundReceiptReturnSourceOut | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState("");

  const [selectedByLineId, setSelectedByLineId] = useState<SelectedMap>({});
  const [qtyByLineId, setQtyByLineId] = useState<QtyMap>({});
  const [receiptRemark, setReceiptRemark] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [currentReceipt, setCurrentReceipt] = useState<InboundReceiptReadOut | null>(null);
  const [currentProgress, setCurrentProgress] = useState<InboundReceiptProgressOut | null>(
    null,
  );
  const [receiptLoading, setReceiptLoading] = useState(false);

  const [releaseLoading, setReleaseLoading] = useState(false);
  const [releaseError, setReleaseError] = useState("");
  const [releaseSuccess, setReleaseSuccess] = useState("");

  const [receivingTask, setReceivingTask] = useState<ReceivingTaskReadOut | null>(null);
  const [receivingTaskLoading, setReceivingTaskLoading] = useState(false);
  const [receivingTaskError, setReceivingTaskError] = useState("");

  const [executionRemark, setExecutionRemark] = useState("");
  const [entriesByLineNo, setEntriesByLineNo] = useState<ReceivingEntriesByLineNo>({});
  const [uomOptionsByLineNo, setUomOptionsByLineNo] =
    useState<ReceivingUomOptionsByLineNo>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmit, setLastSubmit] = useState<ReceivingSubmitOut | null>(null);
  const [scanError, setScanError] = useState("");
  const [scanSuccess, setScanSuccess] = useState("");
  const [resolvingEntryKey, setResolvingEntryKey] = useState<string | null>(null);

  const progressByLineNo = useMemo(() => {
    const map = new Map<number, { received_qty: string; remaining_qty: string }>();
    for (const row of currentProgress?.lines ?? []) {
      map.set(row.line_no, {
        received_qty: row.received_qty,
        remaining_qty: row.remaining_qty,
      });
    }
    return map;
  }, [currentProgress]);

  const selectedOrderRefExistsInList = useMemo(() => {
    return orderRefs.some((row) => row.order_ref === selectedOrderRef);
  }, [orderRefs, selectedOrderRef]);

  const currentReceiptReleasedOrCompleted =
    currentReceipt?.status === "RELEASED" || currentReceipt?.status === "COMPLETED";

  const executionInteractionDisabled =
    currentReceipt?.status === "COMPLETED" || submitting;

  const loadOrderRefs = useCallback(async () => {
    setOrderRefsLoading(true);
    setOrderRefsError("");
    try {
      const rows = await fetchReturnOrderRefs({ limit: 50, days: 90 });
      setOrderRefs(rows);
    } catch (error) {
      setOrderRefsError(getErrorMessage(error, "加载可退订单失败"));
    } finally {
      setOrderRefsLoading(false);
    }
  }, []);

  const resetReceiptAndExecution = useCallback(() => {
    setCurrentReceipt(null);
    setCurrentProgress(null);
    setReceivingTask(null);
    setReceivingTaskError("");
    setExecutionRemark("");
    setEntriesByLineNo({});
    setUomOptionsByLineNo({});
    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);
    setScanError("");
    setScanSuccess("");
    setResolvingEntryKey(null);
  }, []);

  const loadReceivingTask = useCallback(async (receiptNo: string) => {
    setReceivingTaskLoading(true);
    setReceivingTaskError("");
    try {
      const task = await fetchReceivingTask(receiptNo);
      setReceivingTask(task);
    } catch (error) {
      setReceivingTask(null);
      setReceivingTaskError(getErrorMessage(error, "加载回仓执行区失败"));
    } finally {
      setReceivingTaskLoading(false);
    }
  }, []);

  const loadCurrentReceipt = useCallback(
    async (receiptId: number) => {
      setReceiptLoading(true);
      try {
        const [detail, progress] = await Promise.all([
          fetchInboundReceiptDetail(receiptId),
          fetchInboundReceiptProgress(receiptId),
        ]);
        setCurrentReceipt(detail);
        setCurrentProgress(progress);

        if (detail.status === "RELEASED" || detail.status === "COMPLETED") {
          await loadReceivingTask(detail.receipt_no);
        } else {
          setReceivingTask(null);
          setReceivingTaskError("");
        }
      } catch (error) {
        setCreateError(getErrorMessage(error, "加载当前退单入库单失败"));
        resetReceiptAndExecution();
      } finally {
        setReceiptLoading(false);
      }
    },
    [loadReceivingTask, resetReceiptAndExecution],
  );

  const loadSelectedOrder = useCallback(
    async (orderRef: string) => {
      if (!orderRef) {
        setOrderDetail(null);
        setSource(null);
        setSourceError("");
        setSelectedByLineId({});
        setQtyByLineId({});
        resetReceiptAndExecution();
        return;
      }

      setSourceLoading(true);
      setSourceError("");
      setCreateError("");
      setCreateSuccess("");
      setReleaseError("");
      setReleaseSuccess("");

      try {
        const [detail, nextSource] = await Promise.all([
          fetchReturnOrderRefDetail(orderRef),
          fetchInboundReceiptReturnSource(orderRef),
        ]);

        setOrderDetail(detail);
        setSource(nextSource);

        const nextSelected: SelectedMap = {};
        const nextQty: QtyMap = {};
        for (const line of nextSource.lines) {
          nextSelected[line.order_line_id] = Number(line.suggested_planned_qty) > 0;
          nextQty[line.order_line_id] = formatQty(line.suggested_planned_qty);
        }
        setSelectedByLineId(nextSelected);
        setQtyByLineId(nextQty);

        if (nextSource.existing_receipt_id != null) {
          await loadCurrentReceipt(nextSource.existing_receipt_id);
        } else {
          resetReceiptAndExecution();
        }
      } catch (error) {
        setOrderDetail(null);
        setSource(null);
        setSelectedByLineId({});
        setQtyByLineId({});
        resetReceiptAndExecution();
        setSourceError(getErrorMessage(error, "加载退单入库来源失败"));
      } finally {
        setSourceLoading(false);
      }
    },
    [loadCurrentReceipt, resetReceiptAndExecution],
  );

  useEffect(() => {
    void loadOrderRefs();
  }, [loadOrderRefs]);

  useEffect(() => {
    if (!queryOrderKey) return;
    setSelectedOrderRef(queryOrderKey);
  }, [queryOrderKey]);

  useEffect(() => {
    if (!selectedOrderRef) return;
    void loadSelectedOrder(selectedOrderRef);
  }, [loadSelectedOrder, selectedOrderRef]);

  useEffect(() => {
    if (!receivingTask) return;
    const task = receivingTask;
    let cancelled = false;

    async function loadLineUomOptions() {
      const itemIds = [...new Set(task.lines.map((line) => line.item_id))];
      const uomMap = new Map<number, PmsExportUom[]>();

      try {
        const rows = await fetchPmsExportUomsByItems(itemIds);
        for (const uom of rows) {
          const list = uomMap.get(uom.item_id) ?? [];
          list.push(uom);
          uomMap.set(uom.item_id, list);
        }
      } catch {
        for (const itemId of itemIds) {
          uomMap.set(itemId, []);
        }
      }

      if (cancelled) return;

      const next: Record<number, ReceivingActualUomOption[]> = {};
      for (const line of task.lines) {
        next[line.line_no] = buildLineUomOptions(
          line,
          uomMap.get(line.item_id),
        );
      }
      setUomOptionsByLineNo(next);
    }

    void loadLineUomOptions();

    return () => {
      cancelled = true;
    };
  }, [receivingTask]);

  useEffect(() => {
    if (!receivingTask) return;
    if (Object.keys(uomOptionsByLineNo).length === 0) return;

    setEntriesByLineNo((prev) => {
      const next: ReceivingEntriesByLineNo = {};
      for (const line of receivingTask.lines) {
        const lineNo = line.line_no;
        const options = uomOptionsByLineNo[lineNo] ?? [];
        next[lineNo] =
          options.length > 0
            ? buildPresetEntriesFromUoms(options, prev[lineNo])
            : prev[lineNo] ?? [createEmptyReceivingEntryDraft()];
      }
      return next;
    });
  }, [receivingTask, uomOptionsByLineNo]);

  const selectOrderRef = useCallback(
    (next: string) => {
      setSelectedOrderRef(next);
      if (next) {
        setSearchParams({ order_key: next });
      } else {
        setSearchParams({});
      }
    },
    [setSearchParams],
  );

  const updateEntry = useCallback(
    (lineNo: number, index: number, patch: Partial<ReceivingEntryDraft>) => {
      setEntriesByLineNo((prev) => {
        const rows = [...(prev[lineNo] ?? [])];
        const current = rows[index] ?? createEmptyReceivingEntryDraft();
        rows[index] = { ...current, ...patch };
        return { ...prev, [lineNo]: rows };
      });
    },
    [],
  );

  const resolveBarcodeAtEntry = useCallback(
    async (lineNo: number, index: number, rawBarcode: string) => {
      const barcode = rawBarcode.trim();
      if (!barcode) return;

      if (!receivingTask) {
        const msg = "请先发布退单入库单，再进行回仓识别";
        setScanError(msg);
        throw new Error(msg);
      }

      setResolvingEntryKey(`${lineNo}-${index}`);
      setScanError("");
      setScanSuccess("");

      try {
        const result: ReceivingTaskProbeOut = await probeReceivingTaskBarcode(
          receivingTask.receipt_no,
          { barcode },
        );

        const actualItemUomId = result.item_uom_id;
        const actualRatioToBaseSnapshot = result.ratio_to_base;
        const actualUomNameSnapshot = result.uom_name_snapshot;

        if (result.status !== "MATCHED" || result.matched_line_no == null) {
          const msg = result.message || "识别未命中当前退单入库单行";
          setScanError(msg);
          throw new Error(msg);
        }

        if (result.matched_line_no !== lineNo) {
          const msg = `该编码命中的是第 ${result.matched_line_no} 行，请在对应行录入`;
          setScanError(msg);
          throw new Error(msg);
        }

        if (
          actualItemUomId == null ||
          actualRatioToBaseSnapshot == null ||
          !actualUomNameSnapshot
        ) {
          const msg = "后端未返回实际包装单位信息";
          setScanError(msg);
          throw new Error(msg);
        }

        const matchedLine = receivingTask.lines.find(
          (line) => line.line_no === result.matched_line_no,
        );
        if (!matchedLine) {
          const msg = "后端已命中任务行，但当前页面未找到该任务行";
          setScanError(msg);
          throw new Error(msg);
        }

        setEntriesByLineNo((prev) => {
          const currentRows =
            prev[lineNo] ??
            buildPresetEntriesFromUoms(uomOptionsByLineNo[lineNo] ?? []);
          return {
            ...prev,
            [lineNo]: applyResolvedScanToFixedRows(currentRows, {
              barcode,
              actual_item_uom_id: actualItemUomId,
              actual_uom_name_snapshot: actualUomNameSnapshot,
              actual_ratio_to_base_snapshot: actualRatioToBaseSnapshot,
            }),
          };
        });

        const itemName =
          result.item_name_snapshot ||
          matchedLine.item_name_snapshot ||
          `商品 ${matchedLine.item_id}`;

        setScanSuccess(
          `第 ${lineNo} 行识别成功：${itemName} · ${actualUomNameSnapshot}，本次数量自动 +1`,
        );
      } catch (error) {
        const msg = getErrorMessage(error, "识别失败");
        setScanError(msg);
        throw (error instanceof Error ? error : new Error(msg));
      } finally {
        setResolvingEntryKey(null);
      }
    },
    [receivingTask, uomOptionsByLineNo],
  );

  const canSubmit = useMemo(() => {
    if (!receivingTask || submitting || currentReceipt?.status === "COMPLETED") {
      return false;
    }

    let hasAnyEntry = false;

    for (const line of receivingTask.lines) {
      const drafts = entriesByLineNo[line.line_no] ?? [];
      const showDateFields = receivingLineShowsDateFields(line);
      const batchRequired = receivingLineRequiresBatchField(line);

      let lineActualBaseTotal = 0;
      let lineHasEntries = false;

      for (const draft of drafts) {
        const touched = isEntryTouched(draft);
        if (!touched) continue;

        hasAnyEntry = true;
        lineHasEntries = true;

        const qtyText = draft.qty_inbound.trim();
        if (!qtyText) return false;

        const qty = Number(qtyText);
        if (!Number.isFinite(qty) || qty <= 0) return false;

        if (draft.actual_item_uom_id == null) return false;

        const actualRatio = draft.actual_ratio_to_base_snapshot;
        if (
          actualRatio == null ||
          !Number.isFinite(actualRatio) ||
          actualRatio <= 0
        ) {
          return false;
        }

        if (batchRequired && !draft.batch_no.trim()) return false;

        if (
          showDateFields &&
          !draft.production_date.trim() &&
          !draft.expiry_date.trim()
        ) {
          return false;
        }

        lineActualBaseTotal += qty * actualRatio;
      }

      const remainingBase = Number(line.remaining_qty_base);
      if (
        lineHasEntries &&
        Number.isFinite(remainingBase) &&
        lineActualBaseTotal - remainingBase > BASE_EPSILON
      ) {
        return false;
      }
    }

    return hasAnyEntry;
  }, [currentReceipt?.status, entriesByLineNo, receivingTask, submitting]);

  const createReceipt = useCallback(async () => {
    if (!source) {
      setCreateError("请先选择一个已出库且仍可退的订单。");
      return;
    }

    if (source.existing_receipt_id != null) {
      setCreateError(
        `该订单已存在退单入库单：${source.existing_receipt_no || source.existing_receipt_id}`,
      );
      if (!currentReceipt) {
        await loadCurrentReceipt(source.existing_receipt_id);
      }
      return;
    }

    setCreateError("");
    setCreateSuccess("");
    setReleaseError("");
    setReleaseSuccess("");

    const lines: InboundReceiptCreateFromReturnOrderLineIn[] = [];

    for (const line of source.lines) {
      const selected = Boolean(selectedByLineId[line.order_line_id]);
      if (!selected) continue;

      const qtyText = (qtyByLineId[line.order_line_id] ?? "").trim();
      if (!qtyText) {
        setCreateError(`订单行 ${line.order_line_id} 缺少本次生成数量`);
        return;
      }

      const qty = Number(qtyText);
      const remaining = Number(line.qty_remaining_refundable);

      if (!Number.isFinite(qty) || qty <= 0) {
        setCreateError(`订单行 ${line.order_line_id} 的本次生成数量非法`);
        return;
      }

      if (Number.isFinite(remaining) && qty > remaining) {
        setCreateError(
          `订单行 ${line.order_line_id} 的本次生成数量 ${formatQty(qty)} 不能超过剩余可退数量 ${formatQty(
            remaining,
          )}`,
        );
        return;
      }

      lines.push({
        order_line_id: line.order_line_id,
        item_id: line.item_id,
        planned_qty: qtyText,
      });
    }

    if (!lines.length) {
      setCreateError("请至少选择一行并填写大于 0 的本次生成数量。");
      return;
    }

    setCreating(true);
    try {
      const created = await createInboundReceiptFromReturnOrder({
        order_key: source.order_ref,
        remark: normalizeOptionalString(receiptRemark),
        lines,
      });

      setCreateSuccess(`已生成退单入库单：${created.receipt_no}`);
      setSource((prev) =>
        prev
          ? {
              ...prev,
              existing_receipt_id: created.id,
              existing_receipt_no: created.receipt_no,
              existing_receipt_status: created.status,
            }
          : prev,
      );
      await loadCurrentReceipt(created.id);
    } catch (error) {
      setCreateError(getErrorMessage(error, "生成退单入库单失败"));
    } finally {
      setCreating(false);
    }
  }, [
    currentReceipt,
    loadCurrentReceipt,
    qtyByLineId,
    receiptRemark,
    selectedByLineId,
    source,
  ]);

  const releaseReceipt = useCallback(async () => {
    if (!currentReceipt) {
      setReleaseError("当前没有可发布的退单入库单。");
      return;
    }
    if (currentReceipt.status === "RELEASED") {
      setReleaseSuccess("当前退单入库单已发布。");
      return;
    }
    if (currentReceipt.status === "COMPLETED") {
      setReleaseSuccess("当前退单入库单已完成。");
      return;
    }

    setReleaseLoading(true);
    setReleaseError("");
    setReleaseSuccess("");
    try {
      const out = await releaseInboundReceipt(currentReceipt.id);
      await loadCurrentReceipt(currentReceipt.id);
      setSource((prev) =>
        prev
          ? {
              ...prev,
              existing_receipt_id: out.receipt_id,
              existing_receipt_no: out.receipt_no,
              existing_receipt_status: out.status,
            }
          : prev,
      );
      setReleaseSuccess(`发布成功：${out.receipt_no}`);
    } catch (error) {
      setReleaseError(getErrorMessage(error, "发布退单入库单失败"));
    } finally {
      setReleaseLoading(false);
    }
  }, [currentReceipt, loadCurrentReceipt]);

  const submitExecution = useCallback(async () => {
    if (!receivingTask) {
      setSubmitError("请先发布退单入库单。");
      return;
    }

    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);

    const linePayloads: ReceivingLineIn[] = [];

    for (const line of receivingTask.lines) {
      const drafts = entriesByLineNo[line.line_no] ?? [];
      const entries: ReceivingLineIn["entries"] = [];
      const showDateFields = receivingLineShowsDateFields(line);
      const showBatchField = receivingLineShowsBatchField(line);
      const batchRequired = receivingLineRequiresBatchField(line);

      let lineActualBaseTotal = 0;

      for (const draft of drafts) {
        const touched = isEntryTouched(draft);
        const qtyText = draft.qty_inbound.trim();

        if (!touched) continue;

        if (!qtyText) {
          setSubmitError(`任务行 ${line.line_no} 存在未填写数量的实现行`);
          return;
        }

        const qty = Number(qtyText);
        if (!Number.isFinite(qty) || qty <= 0) {
          setSubmitError(`任务行 ${line.line_no} 的回仓数量非法`);
          return;
        }

        if (draft.actual_item_uom_id == null) {
          setSubmitError(`任务行 ${line.line_no} 的实现行请先识别实际包装`);
          return;
        }

        const actualRatio = draft.actual_ratio_to_base_snapshot;
        if (
          actualRatio == null ||
          !Number.isFinite(actualRatio) ||
          actualRatio <= 0
        ) {
          setSubmitError(`任务行 ${line.line_no} 的实际包装倍率非法`);
          return;
        }

        const actualBase = qty * actualRatio;
        lineActualBaseTotal += actualBase;

        if (batchRequired && !draft.batch_no.trim()) {
          setSubmitError(`任务行 ${line.line_no} 需要填写批次号`);
          return;
        }

        if (
          showDateFields &&
          !draft.production_date.trim() &&
          !draft.expiry_date.trim()
        ) {
          setSubmitError(
            `任务行 ${line.line_no} 的实现行至少填写生产日期或到期日期`,
          );
          return;
        }

        entries.push({
          qty_inbound: qty,
          barcode_input: normalizeOptionalString(draft.barcode_input),
          actual_item_uom_id: draft.actual_item_uom_id,
          batch_no: showBatchField ? normalizeOptionalString(draft.batch_no) : null,
          production_date: showDateFields
            ? normalizeOptionalString(draft.production_date)
            : null,
          expiry_date: showDateFields
            ? normalizeOptionalString(draft.expiry_date)
            : null,
          remark: normalizeOptionalString(draft.remark),
        });
      }

      const remainingBase = Number(line.remaining_qty_base);
      if (
        entries.length > 0 &&
        Number.isFinite(remainingBase) &&
        lineActualBaseTotal - remainingBase > BASE_EPSILON
      ) {
        setSubmitError(
          `任务行 ${line.line_no} 的本次基础数量 ${formatQty(
            lineActualBaseTotal,
          )} 不能超过待收基础数量 ${formatQty(line.remaining_qty_base)}`,
        );
        return;
      }

      if (entries.length > 0) {
        linePayloads.push({
          receipt_line_no: line.line_no,
          entries,
        });
      }
    }

    if (linePayloads.length === 0) {
      setSubmitError("请至少填写一条本次回仓实现行");
      return;
    }

    const payload: ReceivingSubmitIn = {
      receipt_no: receivingTask.receipt_no,
      remark: normalizeOptionalString(executionRemark),
      lines: linePayloads,
    };

    setSubmitting(true);
    try {
      const out = await submitReceiving(payload);
      setLastSubmit(out);
      setSubmitSuccess(`提交成功：操作单 #${out.id}`);
      setExecutionRemark("");
      setEntriesByLineNo(buildEmptyEntries(receivingTask, uomOptionsByLineNo));
      setScanError("");
      setScanSuccess("");
      if (currentReceipt) {
        await loadCurrentReceipt(currentReceipt.id);
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error, "提交退单入库回仓失败"));
    } finally {
      setSubmitting(false);
    }
  }, [
    currentReceipt,
    entriesByLineNo,
    executionRemark,
    loadCurrentReceipt,
    receivingTask,
    uomOptionsByLineNo,
  ]);

  const refreshAll = useCallback(async () => {
    await loadOrderRefs();
    if (selectedOrderRef) {
      await loadSelectedOrder(selectedOrderRef);
    }
  }, [loadOrderRefs, loadSelectedOrder, selectedOrderRef]);

  return {
    orderRefs,
    orderRefsLoading,
    orderRefsError,
    selectedOrderRef,
    selectedOrderRefExistsInList,
    selectOrderRef,
    refreshAll,

    orderDetail,
    source,
    sourceLoading,
    sourceError,

    selectedByLineId,
    setSelectedByLineId,
    qtyByLineId,
    setQtyByLineId,
    receiptRemark,
    setReceiptRemark,

    creating,
    createError,
    createSuccess,
    createReceipt,

    currentReceipt,
    currentProgress,
    progressByLineNo,
    receiptLoading,

    releaseLoading,
    releaseError,
    releaseSuccess,
    releaseReceipt,

    currentReceiptReleasedOrCompleted,

    receivingTask,
    receivingTaskLoading,
    receivingTaskError,

    executionRemark,
    setExecutionRemark,
    entriesByLineNo,
    uomOptionsByLineNo,
    updateEntry,
    resolveBarcodeAtEntry,

    scanError,
    scanSuccess,
    resolvingEntryKey,

    submitting,
    submitError,
    submitSuccess,
    lastSubmit,
    canSubmit,
    submitExecution,
    executionInteractionDisabled,
  };
}
