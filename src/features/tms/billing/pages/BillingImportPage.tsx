// src/features/tms/billing/pages/BillingImportPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import BillingImportCard from "../components/BillingImportCard";
import { useBillingImport } from "../hooks/useBillingImport";

const BillingImportPage: React.FC = () => {
  const {
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
  } = useBillingImport();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="运输对账 / 账单导入"
        description="导入承运商账单原始明细（.xlsx），生成对账批次。"
      />

      <BillingImportCard
        carrierCode={carrierCode}
        importBatchNo={importBatchNo}
        billMonth={billMonth}
        fileName={file?.name ?? ""}
        loading={loading}
        error={error}
        result={result}
        onCarrierCodeChange={setCarrierCode}
        onImportBatchNoChange={setImportBatchNo}
        onBillMonthChange={setBillMonth}
        onFileChange={setFile}
        onSubmit={() => void submit()}
      />
    </div>
  );
};

export default BillingImportPage;
