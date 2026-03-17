// src/features/tms/billing/pages/BillingReconcilePage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import BillingReconcileForm from "../components/BillingReconcileForm";
import BillingReconcileResultCard from "../components/BillingReconcileResultCard";
import { useBillingReconcile } from "../hooks/useBillingReconcile";

const BillingReconcilePage: React.FC = () => {
  const {
    carrierCode,
    importBatchNo,
    loading,
    error,
    result,
    setCarrierCode,
    setImportBatchNo,
    submit,
  } = useBillingReconcile();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="运输对账 / 自动对账"
        description="按承运商代码与导入批次触发自动对账，生成差异汇总结果。"
      />

      <BillingReconcileForm
        carrierCode={carrierCode}
        importBatchNo={importBatchNo}
        loading={loading}
        error={error}
        onCarrierCodeChange={setCarrierCode}
        onImportBatchNoChange={setImportBatchNo}
        onSubmit={() => void submit()}
      />

      <BillingReconcileResultCard result={result} />
    </div>
  );
};

export default BillingReconcilePage;
