// src/features/operations/inbound/return-receive/useReturnReceiveWorkbench.ts

import { useEffect } from "react";
import type { ReturnReceiveState } from "./types";
import type { ReturnOrderRefDetailOut, ReturnOrderRefItem, ReturnOrderRefSummaryOut } from "../../../return-tasks/api";
import { useReturnOrderRefsModel } from "./workbench/useReturnOrderRefsModel";
import { useReturnReceiveTaskModel } from "./workbench/useReturnReceiveTaskModel";

export type ReturnReceiveWorkbenchExtra = {
  orderRefs: ReturnOrderRefItem[];
  loadingOrderRefs: boolean;
  orderRefsError: string | null;

  selectedOrderRef: string;
  setSelectedOrderRef: (v: string) => void;

  // ✅ 新：订单详情（shipping + summary + remaining）
  detail: ReturnOrderRefDetailOut | null;
  loadingDetail: boolean;
  detailError: string | null;

  // 兼容旧 UI：仍然提供 summary 三件套
  summary: ReturnOrderRefSummaryOut | null;
  loadingSummary: boolean;
  summaryError: string | null;

  reloadOrderRefs: () => Promise<void>;
};

export function useReturnReceiveWorkbench(): ReturnReceiveState & ReturnReceiveWorkbenchExtra {
  const left = useReturnOrderRefsModel();

  const summary = left.detail?.summary ?? null;

  const right = useReturnReceiveTaskModel({
    selectedOrderRef: left.selectedOrderRef,
    summaryLinesCount: summary?.lines?.length ?? 0,
    loadingDetail: left.loadingDetail,
    onCommitSuccess: async () => {
      await left.reloadOrderRefs();
    },
  });

  // 选中变化：清右侧（避免串单）
  useEffect(() => {
    right.clearWorkArea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left.selectedOrderRef]);

  // 兼容字段：ReturnReceiveState 里必须有这些（由 right 提供）
  const canCreate = right.canCreate;
  const canCommit = right.canCommit;

  // 兼容旧 UI：summary 的 loading/error 直接复用 detail 的状态
  const loadingSummary = left.loadingDetail;
  const summaryError = left.detailError;

  return {
    // ReturnReceiveState（原有字段）
    orderRef: right.orderRef,
    setOrderRef: right.setOrderRef,

    task: right.task,

    loadingCreate: right.loadingCreate,
    error: right.error,

    committing: right.committing,
    commitError: right.commitError,

    qtyInputs: right.qtyInputs,
    setQtyInput: right.setQtyInput,

    canCreate,
    canCommit,

    createTask: right.createTask,
    clearAll: right.clearAll,

    adjustLineQty: right.adjustLineQty,
    applyInputDelta: right.applyInputDelta,
    commit: right.commit,

    // ✅ 新增：commit 成功后“查看即时库存”入口
    lastCommittedItemId: right.lastCommittedItemId,
    clearLastCommitted: right.clearLastCommitted,

    // extra: 左侧上下文
    orderRefs: left.orderRefs,
    loadingOrderRefs: left.loadingOrderRefs,
    orderRefsError: left.orderRefsError,

    selectedOrderRef: left.selectedOrderRef,
    setSelectedOrderRef: left.setSelectedOrderRef,

    detail: left.detail,
    loadingDetail: left.loadingDetail,
    detailError: left.detailError,

    summary,
    loadingSummary,
    summaryError,

    reloadOrderRefs: left.reloadOrderRefs,
  };
}
