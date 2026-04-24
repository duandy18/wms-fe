import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchInboundReversalDetail,
  fetchInboundReversalOptions,
  submitInboundReversal,
} from "../api/inboundReversalApi";
import type {
  InboundReversalDetailOut,
  InboundReversalOptionOut,
  InboundReversalOut,
  InboundReversalRangeDays,
  InboundReversalSourceType,
} from "../contracts/inboundReversal";
import {
  buildInboundReversalOptionLabel,
  parseInboundReversalRangeDays,
  parseInboundReversalSourceType,
} from "../contracts/inboundReversal";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function normalizeOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nowLocalDateTimeValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function parsePositiveIntString(value: string): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function useInventoryInboundReversalPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialDays = parseInboundReversalRangeDays(searchParams.get("days"));
  const initialSourceType = parseInboundReversalSourceType(searchParams.get("source_type"));
  const queryEventId = Number(searchParams.get("event_id") ?? "");

  const [rangeDays, setRangeDays] = useState<InboundReversalRangeDays>(initialDays);
  const [sourceType, setSourceType] = useState<InboundReversalSourceType | null>(
    initialSourceType,
  );

  const [options, setOptions] = useState<InboundReversalOptionOut[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [optionsReloadToken, setOptionsReloadToken] = useState(0);

  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    Number.isFinite(queryEventId) && queryEventId > 0 ? queryEventId : null,
  );

  const [detail, setDetail] = useState<InboundReversalDetailOut | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [occurredAt, setOccurredAt] = useState(nowLocalDateTimeValue());
  const [operatorName, setOperatorName] = useState("");
  const [remark, setRemark] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitResult, setSubmitResult] = useState<InboundReversalOut | null>(null);

  const syncSearch = useCallback(
    (
      nextDays: InboundReversalRangeDays,
      nextSourceType: InboundReversalSourceType | null,
      nextEventId: number | null,
    ) => {
      const params = new URLSearchParams();
      params.set("days", String(nextDays));
      if (nextSourceType) {
        params.set("source_type", nextSourceType);
      }
      if (nextEventId != null && nextEventId > 0) {
        params.set("event_id", String(nextEventId));
      }
      setSearchParams(params);
    },
    [setSearchParams],
  );

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const data = await fetchInboundReversalOptions({
        days: rangeDays,
        limit: 50,
        source_type: sourceType,
      });
      setOptions(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setOptions([]);
      setOptionsError(getErrorMessage(error, "加载入库冲回候选事件失败"));
    } finally {
      setOptionsLoading(false);
    }
  }, [rangeDays, sourceType]);

  const loadDetail = useCallback(async (eventId: number) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      const data = await fetchInboundReversalDetail(eventId);
      setDetail(data);
    } catch (error) {
      setDetail(null);
      setDetailError(getErrorMessage(error, "加载入库事件详情失败"));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    syncSearch(rangeDays, sourceType, selectedEventId);
  }, [rangeDays, selectedEventId, sourceType, syncSearch]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions, optionsReloadToken]);

  useEffect(() => {
    if (selectedEventId == null) {
      setDetail(null);
      setDetailError("");
      return;
    }
    void loadDetail(selectedEventId);
  }, [loadDetail, selectedEventId]);

  const selectedOption = useMemo(() => {
    if (selectedEventId == null) return null;
    return options.find((item) => item.event_id === selectedEventId) ?? null;
  }, [options, selectedEventId]);

  const optionLabel = useCallback((option: InboundReversalOptionOut): string => {
    return buildInboundReversalOptionLabel(option);
  }, []);

  const refreshOptions = useCallback(() => {
    setOptionsReloadToken((value) => value + 1);
  }, []);

  const refreshCurrent = useCallback(async () => {
    if (selectedEventId == null) return;
    await loadDetail(selectedEventId);
    refreshOptions();
  }, [loadDetail, refreshOptions, selectedEventId]);

  const selectRangeDays = useCallback((value: string) => {
    const nextDays = parseInboundReversalRangeDays(value);
    setRangeDays(nextDays);
    setSelectedEventId(null);
    setDetail(null);
    setDetailError("");
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitResult(null);
  }, []);

  const selectSourceType = useCallback((value: string) => {
    const nextSourceType = parseInboundReversalSourceType(value);
    setSourceType(nextSourceType);
    setSelectedEventId(null);
    setDetail(null);
    setDetailError("");
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitResult(null);
  }, []);

  const selectEventId = useCallback((value: string) => {
    const nextId = parsePositiveIntString(value);
    setSelectedEventId(nextId);
    setSubmitError("");
    setSubmitSuccess("");
    setSubmitResult(null);
  }, []);

  const submitCurrent = useCallback(async () => {
    if (selectedEventId == null || detail == null) {
      setSubmitError("请先选择原入库事件。");
      return;
    }
    if (!detail.reversible) {
      setSubmitError(detail.non_reversible_reason ?? "当前事件不允许冲回。");
      return;
    }
    if (!occurredAt.trim()) {
      setSubmitError("请先填写冲回时间。");
      return;
    }

    const normalizedOperatorName = operatorName.trim();
    if (!normalizedOperatorName) {
      setSubmitError("请输入操作人员姓名");
      return;
    }

    const occurredDate = new Date(occurredAt);
    if (Number.isNaN(occurredDate.getTime())) {
      setSubmitError("冲回时间格式非法。");
      return;
    }

    setSubmitLoading(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const out = await submitInboundReversal(selectedEventId, {
        occurred_at: occurredDate.toISOString(),
        operator_name_snapshot: normalizedOperatorName,
        remark: normalizeOptionalString(remark),
      });
      setSubmitResult(out);
      setSubmitSuccess(`冲回成功：生成冲回事件 ${out.event_no}。`);
      refreshOptions();
      await loadDetail(selectedEventId);
    } catch (error) {
      setSubmitError(getErrorMessage(error, "执行入库冲回失败"));
    } finally {
      setSubmitLoading(false);
    }
  }, [detail, loadDetail, occurredAt, operatorName, refreshOptions, remark, selectedEventId]);

  return {
    rangeDays,
    selectRangeDays,

    sourceType,
    selectSourceType,

    options,
    optionsLoading,
    optionsError,
    refreshOptions,
    optionLabel,

    selectedEventId,
    selectedOption,
    selectEventId,

    detail,
    detailLoading,
    detailError,
    refreshCurrent,

    occurredAt,
    setOccurredAt,
    operatorName,
    setOperatorName,
    remark,
    setRemark,

    submitLoading,
    submitError,
    submitSuccess,
    submitResult,
    submitCurrent,
  };
}
