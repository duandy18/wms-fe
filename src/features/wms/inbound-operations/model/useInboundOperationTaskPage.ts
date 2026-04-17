import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchInboundTask,
  submitInboundOperation,
} from "../api/inboundOperationsApi";
import type {
  InboundOperationEntryDraft,
  InboundOperationLineIn,
  InboundOperationSubmitIn,
  InboundOperationSubmitOut,
  InboundTaskReadOut,
} from "../contracts/inboundOperation";
import { createEmptyInboundOperationEntryDraft } from "../contracts/inboundOperation";

type EntriesByLineNo = Record<number, InboundOperationEntryDraft[]>;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isEntryTouched(entry: InboundOperationEntryDraft): boolean {
  return Boolean(
    entry.qty_inbound.trim() ||
      entry.batch_no.trim() ||
      entry.production_date.trim() ||
      entry.expiry_date.trim() ||
      entry.remark.trim(),
  );
}

export function useInboundOperationTaskPage() {
  const { receiptNo } = useParams<{ receiptNo: string }>();
  const receiptNoDecoded = decodeURIComponent(receiptNo ?? "").trim();
  const isValid = receiptNoDecoded.length > 0;

  const [task, setTask] = useState<InboundTaskReadOut | null>(null);
  const [remark, setRemark] = useState("");
  const [entriesByLineNo, setEntriesByLineNo] = useState<EntriesByLineNo>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [lastSubmit, setLastSubmit] = useState<InboundOperationSubmitOut | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const load = useCallback(async () => {
    if (!isValid) {
      setTask(null);
      setError("无效的入库任务号。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await fetchInboundTask(receiptNoDecoded);
      setTask(data);
      setEntriesByLineNo((prev) => {
        const next: EntriesByLineNo = {};
        for (const line of data.lines) {
          const current = prev[line.line_no];
          next[line.line_no] =
            current && current.length > 0
              ? current
              : [createEmptyInboundOperationEntryDraft()];
        }
        return next;
      });
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

  const addEntry = useCallback((lineNo: number) => {
    setEntriesByLineNo((prev) => ({
      ...prev,
      [lineNo]: [...(prev[lineNo] ?? []), createEmptyInboundOperationEntryDraft()],
    }));
  }, []);

  const removeEntry = useCallback((lineNo: number, index: number) => {
    setEntriesByLineNo((prev) => {
      const rows = [...(prev[lineNo] ?? [])];
      rows.splice(index, 1);
      return {
        ...prev,
        [lineNo]: rows.length > 0 ? rows : [createEmptyInboundOperationEntryDraft()],
      };
    });
  }, []);

  const updateEntry = useCallback(
    (lineNo: number, index: number, patch: Partial<InboundOperationEntryDraft>) => {
      setEntriesByLineNo((prev) => {
        const rows = [...(prev[lineNo] ?? [])];
        const current = rows[index] ?? createEmptyInboundOperationEntryDraft();
        rows[index] = { ...current, ...patch };
        return { ...prev, [lineNo]: rows };
      });
    },
    [],
  );

  const submit = useCallback(async () => {
    if (!task) return;

    setSubmitError("");
    setSubmitSuccess("");
    setLastSubmit(null);

    const linePayloads: InboundOperationLineIn[] = [];

    for (const line of task.lines) {
      const drafts = entriesByLineNo[line.line_no] ?? [];
      const entries = [];

      for (const draft of drafts) {
        const touched = isEntryTouched(draft);
        const qtyText = draft.qty_inbound.trim();

        if (!touched) {
          continue;
        }

        if (!qtyText) {
          setSubmitError(`任务行 ${line.line_no} 存在未填写数量的批次子行`);
          return;
        }

        const qty = Number(qtyText);
        if (!Number.isFinite(qty) || qty <= 0) {
          setSubmitError(`任务行 ${line.line_no} 的收货数量非法`);
          return;
        }

        entries.push({
          qty_inbound: qty,
          batch_no: normalizeOptionalString(draft.batch_no),
          production_date: normalizeOptionalString(draft.production_date),
          expiry_date: normalizeOptionalString(draft.expiry_date),
          remark: normalizeOptionalString(draft.remark),
        });
      }

      if (entries.length > 0) {
        linePayloads.push({
          receipt_line_no: line.line_no,
          entries,
        });
      }
    }

    if (linePayloads.length === 0) {
      setSubmitError("请至少填写一条本次收货批次子行");
      return;
    }

    const payload: InboundOperationSubmitIn = {
      receipt_no: task.receipt_no,
      remark: normalizeOptionalString(remark),
      lines: linePayloads,
    };

    setSubmitting(true);
    try {
      const out = await submitInboundOperation(payload);
      setLastSubmit(out);
      setSubmitSuccess(`提交成功：操作单 #${out.id}`);
      setRemark("");
      setReloadToken((v) => v + 1);
    } catch (err) {
      setSubmitError(getErrorMessage(err, "提交收货操作失败"));
    } finally {
      setSubmitting(false);
    }
  }, [entriesByLineNo, remark, task]);

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
    loading,
    error,
    submitting,
    submitError,
    submitSuccess,
    lastSubmit,
    remainingTotal,
    addEntry,
    removeEntry,
    updateEntry,
    reload: () => setReloadToken((v) => v + 1),
    submit,
  };
}
