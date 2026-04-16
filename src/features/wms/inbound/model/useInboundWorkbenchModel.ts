// src/features/wms/inbound/model/useInboundWorkbenchModel.ts

import { useEffect, useState } from "react";

import {
  commitInboundDraft,
  fetchInboundWarehouseOptions,
  fetchPurchaseOrderCompletionLines,
  fetchPurchaseOrderSourceOptions,
  getInboundEventDetail,
  listInboundEvents,
  type InboundWarehouseOption,
  type PurchaseOrderCompletionLoadedLine,
  type PurchaseOrderSourceOption,
} from "../api/inboundWorkbenchApi";
import type {
  InboundDraftHead,
  InboundDraftLine,
  InboundEventDetail,
  InboundEventSummary,
  InboundMode,
  InboundWorkbenchState,
} from "../types";
import {
  createEmptyDraftHead,
  createEmptyDraftLine,
  createInitialWorkbenchState,
  mapModeToSourceType,
} from "../utils";

/**
 * 当前阶段目标：
 * - 统一工作台状态模型独立存在
 * - 前端 UI -> model -> api 闭环逐步接通
 * - 后端不支持的地方直接报错，不做兼容兜底
 */
export function useInboundWorkbenchModel() {
  const [state, setState] = useState<InboundWorkbenchState>(
    createInitialWorkbenchState(),
  );
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState<string | null>(null);

  const [warehouseOptions, setWarehouseOptions] = useState<InboundWarehouseOption[]>([]);
  const [warehouseOptionsLoading, setWarehouseOptionsLoading] = useState(false);
  const [warehouseOptionsError, setWarehouseOptionsError] = useState<string | null>(null);

  const [purchaseOrderOptions, setPurchaseOrderOptions] = useState<PurchaseOrderSourceOption[]>([]);
  const [purchaseOrderOptionsLoading, setPurchaseOrderOptionsLoading] = useState(false);
  const [purchaseOrderOptionsError, setPurchaseOrderOptionsError] = useState<string | null>(null);

  const [purchaseSourceLines, setPurchaseSourceLines] = useState<PurchaseOrderCompletionLoadedLine[]>([]);
  const [purchaseSourceLinesLoading, setPurchaseSourceLinesLoading] = useState(false);
  const [purchaseSourceLinesError, setPurchaseSourceLinesError] = useState<string | null>(null);

  function clearPurchaseSourceState() {
    setPurchaseOrderOptions([]);
    setPurchaseOrderOptionsError(null);
    setPurchaseSourceLines([]);
    setPurchaseSourceLinesError(null);
    setPurchaseSourceLinesLoading(false);
  }

  function setMode(nextMode: InboundMode) {
    setState((prev) => {
      const shouldResetLines = prev.mode !== nextMode && (prev.mode === "PURCHASE" || nextMode === "PURCHASE");
      return {
        ...prev,
        mode: nextMode,
        head: {
          ...createEmptyDraftHead(nextMode),
          occurredAt: prev.head.occurredAt,
          remark: prev.head.remark,
          sourceRef: null,
        },
        lines: shouldResetLines ? [createEmptyDraftLine()] : prev.lines,
      };
    });

    if (nextMode !== "PURCHASE") {
      clearPurchaseSourceState();
    }

    setSubmitError(null);
  }

  function setWarehouseId(nextWarehouseId: number | null) {
    setState((prev) => {
      const changed = prev.warehouseId !== nextWarehouseId;
      if (!changed) {
        return {
          ...prev,
          warehouseId: nextWarehouseId,
        };
      }
      return {
        ...prev,
        warehouseId: nextWarehouseId,
        head: {
          ...prev.head,
          sourceRef: null,
        },
        lines: prev.mode === "PURCHASE" ? [createEmptyDraftLine()] : prev.lines,
      };
    });

    if (state.mode === "PURCHASE") {
      setPurchaseSourceLines([]);
      setPurchaseSourceLinesError(null);
    }

    setSubmitError(null);
  }

  function setHead(nextHead: InboundDraftHead) {
    setState((prev) => ({
      ...prev,
      head: nextHead,
    }));
  }

  function patchHead(patch: Partial<InboundDraftHead>) {
    setState((prev) => ({
      ...prev,
      head: {
        ...prev.head,
        ...patch,
      },
    }));
  }

  function resetHeadByMode(nextMode: InboundMode) {
    setState((prev) => ({
      ...prev,
      mode: nextMode,
      head: createEmptyDraftHead(nextMode),
    }));
  }

  function addLine() {
    setState((prev) => ({
      ...prev,
      lines: [...prev.lines, createEmptyDraftLine()],
    }));
  }

  function replaceLines(nextLines: InboundDraftLine[]) {
    setState((prev) => ({
      ...prev,
      lines: nextLines,
    }));
  }

  function updateLine(localId: string, patch: Partial<InboundDraftLine>) {
    setState((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.localId === localId
          ? {
              ...line,
              ...patch,
            }
          : line,
      ),
    }));
  }

  function removeLine(localId: string) {
    setState((prev) => {
      const nextLines = prev.lines.filter((line) => line.localId !== localId);
      return {
        ...prev,
        lines: nextLines.length > 0 ? nextLines : [createEmptyDraftLine()],
      };
    });
  }

  function resetLines() {
    setState((prev) => ({
      ...prev,
      lines: [createEmptyDraftLine()],
    }));
  }

  function setSubmitting(nextSubmitting: boolean) {
    setState((prev) => ({
      ...prev,
      submitting: nextSubmitting,
    }));
  }

  function setSubmitError(nextSubmitError: string | null) {
    setState((prev) => ({
      ...prev,
      submitError: nextSubmitError,
    }));
  }

  function setLatestEvent(nextEvent: InboundEventDetail | null) {
    setState((prev) => ({
      ...prev,
      latestEvent: nextEvent,
    }));
  }

  function setRecentEvents(nextEvents: InboundEventSummary[]) {
    setState((prev) => ({
      ...prev,
      recentEvents: nextEvents,
    }));
  }

  function buildDraftLineFromPurchaseLine(
    line: PurchaseOrderCompletionLoadedLine,
  ): InboundDraftLine {
    const base = createEmptyDraftLine();
    return {
      ...base,
      itemId: line.itemId,
      uomId: line.uomId,
      poLineId: line.poLineId,
      qtyInput: line.qtyRemainingInput,
    };
  }

  async function loadRecentEvents() {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const rows = await listInboundEvents({
        warehouseId: state.warehouseId,
        sourceType: mapModeToSourceType(state.mode),
        sourceRef: state.head.sourceRef,
        limit: 20,
        offset: 0,
      });
      setRecentEvents(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "读取最近事件失败";
      setEventsError(msg);
    } finally {
      setEventsLoading(false);
    }
  }

  async function loadEventDetail(eventId: number) {
    setEventDetailLoading(true);
    setEventDetailError(null);
    try {
      const detail = await getInboundEventDetail(eventId);
      setLatestEvent(detail);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "读取事件详情失败";
      setEventDetailError(msg);
    } finally {
      setEventDetailLoading(false);
    }
  }

  async function selectPurchaseSourceRef(nextSourceRef: string | null) {
    if (state.mode !== "PURCHASE") {
      patchHead({ sourceRef: nextSourceRef });
      return;
    }

    if (!nextSourceRef) {
      setState((prev) => ({
        ...prev,
        head: {
          ...prev.head,
          sourceRef: null,
        },
        lines: [createEmptyDraftLine()],
      }));
      setPurchaseSourceLines([]);
      setPurchaseSourceLinesError(null);
      setSubmitError(null);
      return;
    }

    const selected = purchaseOrderOptions.find((item) => item.poNo === nextSourceRef);
    if (!selected) {
      setSubmitError("未找到对应的采购单来源");
      setPurchaseSourceLines([]);
      setPurchaseSourceLinesError("未找到对应的采购单来源");
      setState((prev) => ({
        ...prev,
        head: {
          ...prev.head,
          sourceRef: nextSourceRef,
        },
      }));
      return;
    }

    setSubmitError(null);
    setPurchaseSourceLinesLoading(true);
    setPurchaseSourceLinesError(null);
    setState((prev) => ({
      ...prev,
      head: {
        ...prev.head,
        sourceRef: nextSourceRef,
      },
    }));

    try {
      const lines = await fetchPurchaseOrderCompletionLines(selected.poId);
      const remaining = lines.filter((line) => line.qtyRemainingBase > 0);

      setPurchaseSourceLines(remaining);

      if (remaining.length <= 0) {
        setState((prev) => ({
          ...prev,
          lines: [createEmptyDraftLine()],
        }));
        setPurchaseSourceLinesError("当前采购单没有可入库剩余行");
        setSubmitError("当前采购单没有可入库剩余行");
        return;
      }

      setState((prev) => ({
        ...prev,
        lines: remaining.map(buildDraftLineFromPurchaseLine),
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "读取采购单剩余行失败";
      setPurchaseSourceLines([]);
      setPurchaseSourceLinesError(msg);
      setSubmitError(msg);
    } finally {
      setPurchaseSourceLinesLoading(false);
    }
  }

  async function submitDraft() {
    if (state.warehouseId == null) {
      setSubmitError("warehouse_id 必填");
      return;
    }
    if (!state.head.occurredAt) {
      setSubmitError("occurred_at 必填");
      return;
    }
    if (state.mode === "PURCHASE" && !state.head.sourceRef) {
      setSubmitError("采购入库必须选择采购单号");
      return;
    }
    if (state.lines.length === 0) {
      setSubmitError("至少需要一行");
      return;
    }

    if (state.mode === "PURCHASE") {
      const missingPoLine = state.lines.find((line) => line.poLineId == null);
      if (missingPoLine) {
        setSubmitError("采购入库行缺少 po_line_id");
        return;
      }
    }

    const invalidLine = state.lines.find(
      (line) =>
        line.qtyInput.trim() === "" ||
        Number(line.qtyInput) <= 0 ||
        ((line.itemId == null || line.uomId == null) && !line.barcode),
    );
    if (invalidLine) {
      setSubmitError("请先补齐行上的商品/条码、单位和数量");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await commitInboundDraft({
        warehouseId: state.warehouseId,
        sourceType: mapModeToSourceType(state.mode),
        sourceRef: state.head.sourceRef,
        occurredAt: state.head.occurredAt,
        remark: state.head.remark || null,
        lines: state.lines.map((line) => ({
          itemId: line.itemId,
          barcode: line.barcode,
          uomId: line.uomId,
          qtyInput: Number(line.qtyInput),
          lotCodeInput: line.lotCodeInput || null,
          productionDate: line.productionDate || null,
          expiryDate: line.expiryDate || null,
          poLineId: line.poLineId,
          remark: line.remark || null,
        })),
      });

      await loadEventDetail(result.eventId);
      await loadRecentEvents();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "提交入库失败";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setWarehouseOptionsLoading(true);
      setWarehouseOptionsError(null);
      try {
        const rows = await fetchInboundWarehouseOptions();
        if (!cancelled) {
          setWarehouseOptions(rows);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载仓库列表失败";
        if (!cancelled) {
          setWarehouseOptionsError(msg);
          setWarehouseOptions([]);
        }
      } finally {
        if (!cancelled) {
          setWarehouseOptionsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.mode !== "PURCHASE" || state.warehouseId == null) {
      setPurchaseOrderOptions([]);
      setPurchaseOrderOptionsError(null);
      return;
    }

    let cancelled = false;

    async function run() {
      setPurchaseOrderOptionsLoading(true);
      setPurchaseOrderOptionsError(null);
      try {
        const rows = await fetchPurchaseOrderSourceOptions({
          warehouseId: state.warehouseId,
          q: null,
          limit: 20,
        });
        if (!cancelled) {
          setPurchaseOrderOptions(rows);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载采购来源失败";
        if (!cancelled) {
          setPurchaseOrderOptionsError(msg);
          setPurchaseOrderOptions([]);
        }
      } finally {
        if (!cancelled) {
          setPurchaseOrderOptionsLoading(false);
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [state.mode, state.warehouseId]);

  return {
    state,

    eventsLoading,
    eventsError,
    eventDetailLoading,
    eventDetailError,

    warehouseOptions,
    warehouseOptionsLoading,
    warehouseOptionsError,

    purchaseOrderOptions,
    purchaseOrderOptionsLoading,
    purchaseOrderOptionsError,

    purchaseSourceLines,
    purchaseSourceLinesLoading,
    purchaseSourceLinesError,

    setState,
    setMode,
    setWarehouseId,

    setHead,
    patchHead,
    resetHeadByMode,

    addLine,
    replaceLines,
    updateLine,
    removeLine,
    resetLines,

    setSubmitting,
    setSubmitError,

    setLatestEvent,
    setRecentEvents,
    loadRecentEvents,
    loadEventDetail,
    selectPurchaseSourceRef,
    submitDraft,

    derived: {
      sourceType: mapModeToSourceType(state.mode),
      lineCount: state.lines.length,
    },
  };
}
