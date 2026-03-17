// src/features/tms/reconciliation/hooks/useReconciliationPage.ts

import { useEffect, useState } from "react";
import { reconcileCarrierBill } from "../api";
import type { ReconcileCarrierBillResult } from "../types";

function getInitialImportBatchId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const value = (params.get("import_batch_id") ?? "").trim();
  if (!value) {
    return "";
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return "";
  }

  return String(parsed);
}

export function useReconciliationPage() {
  const [importBatchId, setImportBatchId] = useState(getInitialImportBatchId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReconcileCarrierBillResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onPopState = (): void => {
      setImportBatchId(getInitialImportBatchId());
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  async function submit(): Promise<void> {
    const trimmed = importBatchId.trim();
    if (!trimmed) {
      setError("请填写账单批次 ID");
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("账单批次 ID 必须为正整数");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await reconcileCarrierBill({
        import_batch_id: parsed,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "自动对账失败");
    } finally {
      setLoading(false);
    }
  }

  const hasPresetBatch = importBatchId.trim().length > 0;

  return {
    importBatchId,
    loading,
    error,
    result,
    hasPresetBatch,
    setImportBatchId,
    submit,
  };
}
