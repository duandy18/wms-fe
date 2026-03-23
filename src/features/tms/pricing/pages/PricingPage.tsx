// src/features/tms/pricing/pages/PricingPage.tsx

import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import PricingBindCard from "../components/PricingBindCard";
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

    summary,
    actionKey,
    activateNow,
    scheduleActivate,
    deactivateBinding,

    bindProviderId,
    bindWarehouseId,
    bindTemplateId,
    bindTemplateOptions,
    bindTemplateLoading,
    bindTemplateError,
    bindingSubmitting,
    bindingError,
    bindingOk,
    setBindProviderId,
    setBindWarehouseId,
    setBindTemplateId,
    submitBindCard,

    warehouseOptions,
  } = usePricingPage();

  const actionDisabled = providersLoading || loading;
  const abnormalCount =
    summary.bindingDisabledCount + summary.providerDisabledCount;

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="运价管理"
        description={`当前 ${summary.total} 行，已生效 ${summary.activeCount}，待生效 ${summary.scheduledCount}，未挂收费表 ${summary.noActiveTemplateCount}，异常 ${abnormalCount}`}
      />

      {providersError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          快递网点选项加载失败：{providersError}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="text-sm text-emerald-700">已生效</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-900">
            {summary.activeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
          <div className="text-sm text-sky-700">待生效</div>
          <div className="mt-2 text-2xl font-semibold text-sky-900">
            {summary.scheduledCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="text-sm text-amber-700">未挂收费表</div>
          <div className="mt-2 text-2xl font-semibold text-amber-900">
            {summary.noActiveTemplateCount}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-4">
          <div className="text-sm text-slate-700">已停止使用收费表</div>
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
      </section>

      <section>
        <PricingBindCard
          providerOptions={providerOptions}
          warehouseOptions={warehouseOptions}
          templateOptions={bindTemplateOptions}
          providerId={bindProviderId}
          warehouseId={bindWarehouseId}
          templateId={bindTemplateId}
          submitting={bindingSubmitting || actionDisabled}
          templateLoading={bindTemplateLoading}
          error={bindingError}
          ok={bindingOk}
          templateError={bindTemplateError}
          onChangeProviderId={setBindProviderId}
          onChangeWarehouseId={setBindWarehouseId}
          onChangeTemplateId={setBindTemplateId}
          onSubmit={() => void submitBindCard()}
        />
      </section>

      <PricingTable
        rows={rows}
        loading={loading}
        error={error}
        actionKey={actionKey}
        activateNow={activateNow}
        scheduleActivate={scheduleActivate}
        deactivateBinding={deactivateBinding}
      />
    </div>
  );
};

export default PricingPage;
