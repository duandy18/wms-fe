import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { PublicAggregateUom } from "../../../../domains/pms/public/contracts/itemAggregate";
import { fetchItemAggregate } from "../../../../domains/pms/public/itemAggregateClient";
import {
  fetchReceivingTask,
  probeReceivingTaskBarcode,
  submitReceiving,
} from "../api/receivingApi";
import {
  createEmptyReceivingEntryDraft,
  type ReceivingActualUomOption,
  type ReceivingEntryDraft,
  type ReceivingLineIn,
  type ReceivingSubmitIn,
  type ReceivingSubmitOut,
  type ReceivingTaskProbeOut,
  type ReceivingTaskReadOut,
  receivingLineRequiresBatchField,
  receivingLineShowsBatchField,
  receivingLineShowsDateFields,
} from "../contracts/receiving";
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
} from "../utils/fixedRows";

export function useReceivingTaskPage() {
  const { receiptNo } = useParams<{ receiptNo: string }>();
  const receiptNoDecoded = decodeURIComponent(receiptNo ?? "").trim();
  const isValid = receiptNoDecoded.length > 0;

  const [task, setTask] = useState<ReceivingTaskReadOut | null>(null);
  const [remark, setRemark] = useState("");
  const [entriesByLineNo, setEntriesByLineNo] =
    useState<ReceivingEntriesByLineNo>({});
  const [uomOptionsByLineNo, setUomOptionsByLineNo] = useState<
    Record<number, ReceivingActualUomOption[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmit, setLastSubmit] = useState<ReceivingSubmitOut | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [resolvingEntryKey, setResolvingEntryKey] = useState<string | null>(
    null,
  );
  const [scanError, setScanError] = useState("");
  const [scanSuccess, setScanSuccess] = useState("");

  const load = useCallback(async () => {
    if (!isValid) {
      setTask(null);
      setError("无效的入库任务号。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchReceivingTask(receiptNoDecoded);
      setTask(data);
    } catch (err) {
      setTask(null);
      setError(getErrorMessage(err, "加载收货任务失败"));
    } finally {
      setLoading(false);
    }
  }, [isValid, receiptNoDecoded]);

  useEffect(() => {
    void load();
  }, [load, reloadToken]);

  useEffect(() => {
    if (!task) return;
    const detail = task;

    let cancelled = false;

    async function loadLineUomOptions() {
      const itemIds = [...new Set(detail.lines.map((line) => line.item_id))];
      const aggregateMap = new Map<number, PublicAggregateUom[]>();

      await Promise.all(
        itemIds.map(async (itemId) => {
          try {
            const aggregate = await fetchItemAggregate(itemId);
            aggregateMap.set(itemId, aggregate.uoms ?? []);
          } catch {
            aggregateMap.set(itemId, []);
          }
        }),
      );

      if (cancelled) return;

      const next: Record<number, ReceivingActualUomOption[]> = {};
      for (const line of detail.lines) {
        next[line.line_no] = buildLineUomOptions(
          line,
          aggregateMap.get(line.item_id),
        );
      }
      setUomOptionsByLineNo(next);
    }

    void loadLineUomOptions();

    return () => {
      cancelled = true;
    };
  }, [task]);

  useEffect(() => {
    if (!task) return;
    if (Object.keys(uomOptionsByLineNo).length === 0) return;

    setEntriesByLineNo((prev) => {
      const next: ReceivingEntriesByLineNo = {};
      for (const line of task.lines) {
        const options = uomOptionsByLineNo[line.line_no] ?? [];
        next[line.line_no] =
          options.length > 0
            ? buildPresetEntriesFromUoms(options, prev[line.line_no])
            : prev[line.line_no] ?? [createEmptyReceivingEntryDraft()];
      }
      return next;
    });
  }, [task, uomOptionsByLineNo]);

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

  const selectActualUom = useCallback(
    (lineNo: number, index: number, actualItemUomId: number | null) => {
      setEntriesByLineNo((prev) => {
        const rows = [...(prev[lineNo] ?? [])];
        const current = rows[index] ?? createEmptyReceivingEntryDraft();

        if (actualItemUomId == null) {
          rows[index] = {
            ...current,
            actual_item_uom_id: null,
            actual_uom_name_snapshot: "",
            actual_ratio_to_base_snapshot: null,
          };
          return { ...prev, [lineNo]: rows };
        }

        const option = (uomOptionsByLineNo[lineNo] ?? []).find(
          (x) => x.actual_item_uom_id === actualItemUomId,
        );

        rows[index] = {
          ...current,
          actual_item_uom_id: actualItemUomId,
          actual_uom_name_snapshot: option?.actual_uom_name_snapshot ?? "",
          actual_ratio_to_base_snapshot:
            option?.actual_ratio_to_base_snapshot ?? null,
        };
        return { ...prev, [lineNo]: rows };
      });
    },
    [uomOptionsByLineNo],
  );

  const resolveBarcodeAtEntry = useCallback(
    async (lineNo: number, index: number, rawBarcode: string) => {
      const barcode = rawBarcode.trim();
      if (!barcode) return;

      if (!task) {
        const msg = "请先加载收货任务，再进行识别";
        setScanError(msg);
        throw new Error(msg);
      }

      setResolvingEntryKey(`${lineNo}-${index}`);
      setScanError("");
      setScanSuccess("");

      try {
        const result: ReceivingTaskProbeOut = await probeReceivingTaskBarcode(
          task.receipt_no,
          { barcode },
        );

        const actualItemUomId = result.item_uom_id;
        const actualRatioToBaseSnapshot = result.ratio_to_base;
        const actualUomNameSnapshot = result.uom_name_snapshot;

        if (result.status !== "MATCHED" || result.matched_line_no == null) {
          const msg = result.message || "识别未命中当前收货单行";
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

        const matchedLine = task.lines.find(
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
    [task, uomOptionsByLineNo],
  );

  const submit = useCallback(async () => {
    if (!task) return;

    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);

    const linePayloads: ReceivingLineIn[] = [];

    for (const line of task.lines) {
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
          setSubmitError(`任务行 ${line.line_no} 的收货数量非法`);
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
          batch_no: showBatchField
            ? normalizeOptionalString(draft.batch_no)
            : null,
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
      setSubmitError("请至少填写一条本次收货实现行");
      return;
    }

    const payload: ReceivingSubmitIn = {
      receipt_no: task.receipt_no,
      remark: normalizeOptionalString(remark),
      lines: linePayloads,
    };

    setSubmitting(true);
    try {
      const out = await submitReceiving(payload);
      setLastSubmit(out);
      setSubmitSuccess(`提交成功：操作单 #${out.id}`);
      setRemark("");
      setEntriesByLineNo(buildEmptyEntries(task, uomOptionsByLineNo));
      setScanError("");
      setScanSuccess("");
      setReloadToken((v) => v + 1);
    } catch (err) {
      setSubmitError(getErrorMessage(err, "提交收货作业失败"));
    } finally {
      setSubmitting(false);
    }
  }, [entriesByLineNo, remark, task, uomOptionsByLineNo]);

  const canSubmit = useMemo(() => {
    if (!task || submitting) return false;

    let hasAnyEntry = false;

    for (const line of task.lines) {
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
  }, [entriesByLineNo, task, submitting]);

  const remainingTotal = useMemo(() => {
    if (!task) return "0";
    const total = task.lines.reduce((sum, line) => {
      const v = Number(line.remaining_qty || "0");
      return sum + (Number.isFinite(v) ? v : 0);
    }, 0);
    return String(total);
  }, [task]);

  return {
    receiptNo: receiptNoDecoded,
    isValid,
    task,
    remark,
    setRemark,
    entriesByLineNo,
    uomOptionsByLineNo,
    loading,
    error,
    canSubmit,
    submitting,
    submitError,
    submitSuccess,
    lastSubmit,
    remainingTotal,
    resolvingEntryKey,
    scanError,
    scanSuccess,
    updateEntry,
    selectActualUom,
    resolveBarcodeAtEntry,
    reload: () => setReloadToken((v) => v + 1),
    submit,
  };
}
