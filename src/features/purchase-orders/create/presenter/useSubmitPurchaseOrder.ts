// src/features/purchase-orders/create/presenter/useSubmitPurchaseOrder.ts

import { useState } from "react";
import { createPurchaseOrder } from "../../api";
import type { LineDraft } from "./lineDraft";
import { buildPayloadLines } from "./lineDraft";
import { datetimeLocalToIsoOrThrow, getErrorMessage } from "../utils";

export function useSubmitPurchaseOrder(args: {
  supplierId: number | null;
  supplierName: string;
  warehouseId: string;
  purchaser: string;
  purchaseTime: string;
  remark: string;
  lines: LineDraft[];
  onAfterSuccessReset: () => void;
}): {
  submitting: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  submit: (onSuccess?: (poId: number) => void) => Promise<void>;
} {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (onSuccess?: (poId: number) => void) => {
    setError(null);

    const { supplierId, warehouseId, purchaser, purchaseTime, remark, lines } = args;

    // 供应商必选（终态以 supplier_id 为准）
    if (supplierId == null || !Number.isFinite(supplierId) || supplierId <= 0) {
      setError("请选择供应商");
      return;
    }

    // 仓库必填：不再做“空值默认为 1”的兼容兜底
    const warehouseText = warehouseId.trim();
    if (!warehouseText) {
      setError("请选择仓库");
      return;
    }

    const wid = Number(warehouseText);
    if (Number.isNaN(wid) || wid <= 0) {
      setError("仓库 ID 非法");
      return;
    }

    // 采购人必填
    const purchaserTrimmed = purchaser.trim();
    if (!purchaserTrimmed) {
      setError("请填写采购人");
      return;
    }

    // 采购时间必填
    let purchaseTimeIso: string;
    try {
      purchaseTimeIso = datetimeLocalToIsoOrThrow(purchaseTime);
    } catch (e) {
      setError(e instanceof Error ? e.message : "采购时间格式非法，请重新选择");
      return;
    }

    let normalizedLines;
    try {
      normalizedLines = buildPayloadLines(lines);
    } catch (e) {
      setError(e instanceof Error ? e.message : "行校验失败");
      return;
    }

    if (normalizedLines.length === 0) {
      setError("请至少填写一行有效的商品行");
      return;
    }

    setSubmitting(true);
    try {
      const po = await createPurchaseOrder({
        supplier_id: supplierId,
        warehouse_id: wid,
        purchaser: purchaserTrimmed,
        purchase_time: purchaseTimeIso,
        remark: remark.trim() || null,
        lines: normalizedLines,
      });

      args.onAfterSuccessReset();
      onSuccess?.(po.id);
    } catch (err) {
      console.error("createPurchaseOrder failed", err);
      setError(getErrorMessage(err, "创建多行采购单失败"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    error,
    setError,
    submit,
  };
}
