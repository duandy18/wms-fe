// src/features/tms/pricing/components/PricingBindCard.tsx

import React from "react";
import { UI } from "../../providers/ui";
import type { PricingProviderOption } from "../api";
import type { PricingBindingTemplateCandidate } from "../types";
import type { WarehouseOption } from "../hooks/usePricingPage";

type Props = {
  providerOptions: PricingProviderOption[];
  warehouseOptions: WarehouseOption[];
  templateOptions: PricingBindingTemplateCandidate[];

  providerId: string;
  warehouseId: string;
  templateId: string;

  submitting: boolean;
  templateLoading: boolean;
  error: string;
  ok: string;
  templateError: string;

  onChangeProviderId: (v: string) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangeTemplateId: (v: string) => void;
  onSubmit: () => void | Promise<void>;
};

const PricingBindCard: React.FC<Props> = ({
  providerOptions,
  warehouseOptions,
  templateOptions,
  providerId,
  warehouseId,
  templateId,
  submitting,
  templateLoading,
  error,
  ok,
  templateError,
  onChangeProviderId,
  onChangeWarehouseId,
  onChangeTemplateId,
  onSubmit,
}) => {
  const templateDisabled =
    submitting || templateLoading || !providerId || !warehouseId;

  return (
    <section className={UI.card}>
      <div>
        <div className={`${UI.h2} font-semibold text-slate-900`}>
          配置关联
        </div>
        <div className="mt-1 text-sm text-slate-600">
          选择快递网点、仓库与收费表。若关联已存在，则直接更新当前收费表。
        </div>
      </div>

      {error ? <div className={UI.error}>{error}</div> : null}
      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {ok}
        </div>
      ) : null}
      {templateError ? <div className={UI.error}>{templateError}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className={UI.field}>
          <span className={UI.label}>快递网点</span>
          <select
            className={UI.select}
            value={providerId}
            disabled={submitting}
            onChange={(e) => onChangeProviderId(e.target.value)}
          >
            <option value="">请选择快递网点</option>
            {providerOptions.map((item) => (
              <option key={item.provider_id} value={String(item.provider_id)}>
                {item.provider_code
                  ? `${item.provider_code} ${item.provider_name}`
                  : item.provider_name}
                {item.provider_active ? "" : "（已停用）"}
              </option>
            ))}
          </select>
        </label>

        <label className={UI.field}>
          <span className={UI.label}>仓库</span>
          <select
            className={UI.select}
            value={warehouseId}
            disabled={submitting}
            onChange={(e) => onChangeWarehouseId(e.target.value)}
          >
            <option value="">请选择仓库</option>
            {warehouseOptions.map((item) => (
              <option
                key={item.warehouse_id}
                value={String(item.warehouse_id)}
              >
                {item.warehouse_name}
              </option>
            ))}
          </select>
        </label>

        <label className={UI.field}>
          <span className={UI.label}>收费表</span>
          <select
            className={UI.select}
            value={templateId}
            disabled={templateDisabled}
            onChange={(e) => onChangeTemplateId(e.target.value)}
          >
            <option value="">
              {templateLoading ? "收费表加载中…" : "请选择收费表"}
            </option>
            {templateOptions.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={UI.btnPrimaryGreen}
          disabled={submitting}
          onClick={() => void onSubmit()}
        >
          {submitting ? "保存中…" : "保存"}
        </button>
      </div>
    </section>
  );
};

export default PricingBindCard;
