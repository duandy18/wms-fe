// src/features/tms/billing/hooks/useBillingReconcile.ts

import { useState } from "react";
import { reconcileCarrierBill } from "../api";
import type { ReconcileCarrierBillResult } from "../types";

export function useBillingReconcile() {
  const [carrierCode, setCarrierCode] = useState("");
  const [importBatchNo, setImportBatchNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReconcileCarrierBillResult | null>(null);

  async function submit(): Promise<void> {
    if (!carrierCode.trim()) {
      setError("请填写承运商代码");
      return;
    }
    if (!importBatchNo.trim()) {
      setError("请填写导入批次号");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await reconcileCarrierBill({
        carrier_code: carrierCode.trim(),
        import_batch_no: importBatchNo.trim(),
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "自动对账失败");
    } finally {
      setLoading(false);
    }
  }

  return {
    carrierCode,
    importBatchNo,
    loading,
    error,
    result,
    setCarrierCode,
    setImportBatchNo,
    submit,
  };
}
