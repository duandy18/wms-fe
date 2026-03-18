// src/features/tms/billing/pages/BillingItemsPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import BillingImportCard from "../components/BillingImportCard";
import BillingItemsFilters from "../components/BillingItemsFilters";
import BillingItemsTable from "../components/BillingItemsTable";
import { useBillingImport } from "../hooks/useBillingImport";
import { useBillingItemsPage } from "../hooks/useBillingItemsPage";
import { fetchShippingProviders } from "../../providers/api/providers";
import type { ShippingProvider } from "../../providers/api/types";

type ProviderOption = {
  code: string;
  name: string;
};

function toProviderOption(provider: ShippingProvider): ProviderOption | null {
  const code = String(provider.code ?? "").trim();
  const name = String(provider.name ?? "").trim();

  if (!code || !name) {
    return null;
  }

  return {
    code,
    name,
  };
}

const BillingItemsPage: React.FC = () => {
  const {
    query,
    rows,
    total,
    loading,
    error,
    currentPage,
    totalPages,
    setField,
    reset,
    setOffset,
    reload,
  } = useBillingItemsPage();

  const {
    carrierCode,
    file,
    loading: importLoading,
    error: importError,
    result: importResult,
    setCarrierCode,
    setFile,
    submit,
  } = useBillingImport();

  const [providersLoading, setProvidersLoading] = useState(false);
  const [providersError, setProvidersError] = useState("");
  const [providers, setProviders] = useState<ShippingProvider[]>([]);

  useEffect(() => {
    if (!importResult) {
      return;
    }
    setField("carrier_code", importResult.carrier_code);
    setField("tracking_no", "");
  }, [importResult, setField]);

  useEffect(() => {
    async function loadProviders(): Promise<void> {
      setProvidersLoading(true);
      setProvidersError("");

      try {
        const res = await fetchShippingProviders({ active: true });
        setProviders(res ?? []);
      } catch (err) {
        setProviders([]);
        setProvidersError(err instanceof Error ? err.message : "加载快递网点失败");
      } finally {
        setProvidersLoading(false);
      }
    }

    void loadProviders();
  }, []);

  const providerOptions = useMemo(() => {
    return providers
      .map(toProviderOption)
      .filter((item): item is ProviderOption => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  }, [providers]);

  return (
    <div className="space-y-4 p-6">
      <PageTitle
        title="快递账单"
        description={`当前结果 ${total} 条明细，第 ${currentPage} / ${totalPages || 1} 页。页面上半部分负责导入，下半部分负责查看账单明细。`}
      />

      <BillingImportCard
        carrierCode={carrierCode}
        fileName={file?.name ?? ""}
        loading={importLoading}
        error={importError}
        result={importResult}
        providerOptions={providerOptions}
        providersLoading={providersLoading}
        providersError={providersError}
        onCarrierCodeChange={setCarrierCode}
        onFileChange={setFile}
        onSubmit={() => void submit()}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-base font-semibold text-slate-900">快递账单</div>
        </div>

        <BillingItemsFilters
          query={query}
          loading={loading}
          onChange={setField}
          onApply={() => void reload()}
          onReset={reset}
        />

        <div className="mt-4">
          <BillingItemsTable rows={rows} loading={loading} error={error} />
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setOffset(Math.max(0, query.offset - query.limit))}
            disabled={query.offset <= 0}
          >
            上一页
          </button>

          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setOffset(query.offset + query.limit)}
            disabled={query.offset + query.limit >= total}
          >
            下一页
          </button>
        </div>
      </section>
    </div>
  );
};

export default BillingItemsPage;
