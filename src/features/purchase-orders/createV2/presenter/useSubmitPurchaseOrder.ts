// src/features/purchase-orders/createV2/presenter/useSubmitPurchaseOrder.ts

import { useState } from "react";
import { createPurchaseOrderV2, type PurchaseOrderWithLines } from "../../api";
import type { LineDraft } from "../lineDraft";
import { buildPayloadLines } from "../lineDraft";
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
  lastCreatedPo: PurchaseOrderWithLines | null;
  submitting: boolean;
  error: string | null;
  setError: (v: string | null) => void;
  submit: (onSuccess?: (poId: number) => void) => Promise<void>;
} {
  const [lastCreatedPo, setLastCreatedPo] = useState<PurchaseOrderWithLines | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (onSuccess?: (poId: number) => void) => {
    setError(null);

    const { supplierId, supplierName, warehouseId, purchaser, purchaseTime, remark, lines } = args;

    // 供应商必选
    if (!supplierId || !supplierName.trim()) {
      setError("请选择供应商");
      return;
    }

    // 仓库必填
    const wid = Number(warehouseId.trim() || "1");
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
      const po = await createPurchaseOrderV2({
        supplier: supplierName,
        supplier_id: supplierId,
        supplier_name: supplierName,
        warehouse_id: wid,
        purchaser: purchaserTrimmed,
        purchase_time: purchaseTimeIso,
        remark: remark.trim() || null,
        lines: normalizedLines,
      });

      setLastCreatedPo(po);

      args.onAfterSuccessReset();
      onSuccess?.(po.id);
    } catch (err) {
       
      console.error("createPurchaseOrderV2 failed", err);
      setError(getErrorMessage(err, "创建多行采购单失败"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    lastCreatedPo,
    submitting,
    error,
    setError,
    submit,
  };
}
