// src/features/tms/billing/hooks/useBillingImport.ts

import { useState } from "react";
import { importCarrierBill } from "../api";
import type { CarrierBillImportResult } from "../types";

export function useBillingImport() {
  const [carrierCode, setCarrierCode] = useState("");
  const [importBatchNo, setImportBatchNo] = useState("");
  const [billMonth, setBillMonth] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CarrierBillImportResult | null>(null);

  async function submit(): Promise<void> {
    if (!carrierCode.trim()) {
      setError("请填写承运商代码");
      return;
    }
    if (!importBatchNo.trim()) {
      setError("请填写导入批次号");
      return;
    }
    if (!file) {
      setError("请上传 .xlsx 对账单文件");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("carrier_code", carrierCode.trim());
      formData.append("import_batch_no", importBatchNo.trim());
      if (billMonth.trim()) {
        formData.append("bill_month", billMonth.trim());
      }
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
    importBatchNo,
    billMonth,
    file,
    loading,
    error,
    result,
    setCarrierCode,
    setImportBatchNo,
    setBillMonth,
    setFile,
    submit,
  };
}
