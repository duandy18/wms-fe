// src/features/tms/pricing/pages/PricingPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import PricingFilters from "../components/PricingFilters";
import PricingTable from "../components/PricingTable";
import { usePricingPage } from "../hooks/usePricingPage";

const PricingPage: React.FC = () => {
  const {
    rows,
    loading,
    error,
    filters,
    warehouseOptions,
    statusOptions,
    summary,
    setField,
    reset,
    reload,
    bindRow,
    toggleBinding,
    createSchemeRow,
  } = usePricingPage();

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="服务关系管理"
        description={`当前 ${summary.total} 行，已就绪 ${summary.readyCount}，缺运价 ${summary.noActiveSchemeCount}，绑定停用 ${summary.bindingDisabledCount}`}
      />

      <PricingFilters
        filters={filters}
        loading={loading}
        warehouseOptions={warehouseOptions}
        statusOptions={statusOptions}
        onChange={setField}
        onReset={reset}
        onReload={() => void reload()}
      />

      <PricingTable
        rows={rows}
        loading={loading}
        error={error}
        bindRow={bindRow}
        toggleBinding={toggleBinding}
        createSchemeRow={createSchemeRow}
      />
    </div>
  );
};

export default PricingPage;
