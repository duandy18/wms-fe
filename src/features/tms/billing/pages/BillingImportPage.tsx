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

  const viewBatchHref = result
    ? `/tms/billing/items?import_batch_id=${result.import_batch_id}`
    : null;

  const goReconcileHref = result
    ? `/tms/reconciliation?import_batch_id=${result.import_batch_id}`
    : null;

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="快递账单导入"
        description="导入承运商账单原始明细（.xlsx）。导入成功后会形成一个账单批次，后续账单查看与对账都围绕该批次展开。"
      />

      <BillingImportCard
        carrierCode={carrierCode}
        importBatchNo={importBatchNo}
        billMonth={billMonth}
        fileName={file?.name ?? ""}
        loading={loading}
        error={error}
        result={result}
        viewBatchHref={viewBatchHref}
        goReconcileHref={goReconcileHref}
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
