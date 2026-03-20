// src/features/tms/pricing/components/PricingBindCard.tsx

import React from "react";
import { UI } from "../../providers/ui";
import type { PricingProviderOption } from "../api";
import type { WarehouseOption } from "../hooks/usePricingPage";

type Props = {
  providerOptions: PricingProviderOption[];
  warehouseOptions: WarehouseOption[];
  providerId: string;
  warehouseId: string;
  active: boolean;
  submitting: boolean;
  error: string;
  ok: string;
  onChangeProviderId: (v: string) => void;
  onChangeWarehouseId: (v: string) => void;
  onChangeActive: (v: boolean) => void;
  onSubmit: () => void | Promise<void>;
};

const PricingBindCard: React.FC<Props> = ({
  providerOptions,
  warehouseOptions,
  providerId,
  warehouseId,
  active,
  submitting,
  error,
  ok,
  onChangeProviderId,
  onChangeWarehouseId,
  onChangeActive,
  onSubmit,
}) => {
  return (
    <section className={UI.card}>
      <div>
        <div className={`${UI.h2} font-semibold text-slate-900`}>绑定仓库</div>
        <div className="mt-1 text-sm text-slate-600">
          建立快递网点与仓库的服务关系。建立后，才能在这条关系下创建运价。
        </div>
      </div>

      {error ? <div className={UI.error}>{error}</div> : null}
      {ok ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {ok}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <option key={item.warehouse_id} value={String(item.warehouse_id)}>
                {item.warehouse_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={active}
          disabled={submitting}
          onChange={(e) => onChangeActive(e.target.checked)}
        />
        绑定后立即启用关系
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className={UI.btnPrimaryGreen}
          disabled={submitting}
          onClick={() => void onSubmit()}
        >
          {submitting ? "保存中…" : "绑定并保存"}
        </button>
      </div>
    </section>
  );
};

export default PricingBindCard;
