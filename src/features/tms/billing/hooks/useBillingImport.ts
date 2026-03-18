// src/features/tms/billing/hooks/useBillingImport.ts

import { useState } from "react";
import { importCarrierBill } from "../api";
import type { CarrierBillImportResult } from "../types";

export function useBillingImport() {
  const [carrierCode, setCarrierCode] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CarrierBillImportResult | null>(null);

  async function submit(): Promise<void> {
    if (!carrierCode.trim()) {
      setError("请选择快递公司");
      return;
    }
    if (!file) {
      setError("请上传 .xlsx 账单文件");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("carrier_code", carrierCode.trim());
      formData.append("file", file);

      const res = await importCarrierBill(formData);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "账单导入失败");
    } finally {
      setLoading(false);
    }
  }

  return {
    carrierCode,
    file,
    loading,
    error,
    result,
    setCarrierCode,
    setFile,
    submit,
  };
}
