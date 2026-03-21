// src/features/tms/pricing/pages/PricingPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import PricingBindCard from "../components/PricingBindCard";
import PricingFilters from "../components/PricingFilters";
import PricingTable from "../components/PricingTable";
import { usePricingPage } from "../hooks/usePricingPage";

const PricingPage: React.FC = () => {
  const {
    rows,
    loading,
    error,

    providersLoading,
    providersError,
    providerOptions,

    filters,
    warehouseOptions,
    statusOptions,
    summary,
    setField,
    reset,
    reload,
    bindRow,
    toggleBinding,

    bindProviderId,
    bindWarehouseId,
    bindActive,
    bindingSubmitting,
    bindingError,
    bindingOk,
    setBindProviderId,
    setBindWarehouseId,
    setBindActive,
    submitBindCard,
  } = usePricingPage();

  const actionDisabled = providersLoading || loading;
  const abnormalCount =
    summary.bindingDisabledCount +
    summary.providerDisabledCount +
    summary.templateArchivedCount;

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="运价管理"
        description={`当前 ${summary.total} 行，已就绪 ${summary.readyCount}，未挂模板 ${summary.noActiveTemplateCount}，异常 ${abnormalCount}`}
      />

      {providersError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          快递网点选项加载失败：{providersError}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="text-sm text-emerald-700">已就绪</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {summary.readyCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="text-sm text-amber-700">未挂模板</div>
          <div className="mt-2 text-2xl font-semibold text-amber-900">
            {summary.noActiveTemplateCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-700">绑定停用</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.bindingDisabledCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-700">网点停用</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.providerDisabledCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-700">模板已归档</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {summary.templateArchivedCount}
          </div>
        </div>
      </section>

      <section>
        <PricingBindCard
          providerOptions={providerOptions}
          warehouseOptions={warehouseOptions}
          providerId={bindProviderId}
          warehouseId={bindWarehouseId}
          active={bindActive}
          submitting={bindingSubmitting || actionDisabled}
          error={bindingError}
          ok={bindingOk}
          onChangeProviderId={setBindProviderId}
          onChangeWarehouseId={setBindWarehouseId}
          onChangeActive={setBindActive}
          onSubmit={() => void submitBindCard()}
        />
      </section>

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
      />
    </div>
  );
};

export default PricingPage;
