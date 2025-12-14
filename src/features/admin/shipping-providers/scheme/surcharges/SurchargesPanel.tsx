// src/features/admin/shipping-providers/scheme/surcharges/SurchargesPanel.tsx

import React from "react";
import type { PricingSchemeDetail, PricingSchemeSurcharge } from "../../api";
import { SurchargeCreateForm, type CreateSurchargePayload } from "./SurchargeCreateForm";
import { SurchargeList } from "./SurchargeList";

export const SurchargesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError: (msg: string) => void;

  onCreate: (payload: CreateSurchargePayload) => Promise<void>;
  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({ detail, disabled, onError, onCreate, onToggle, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">附加费（Surcharge）维护</div>
        <div className="mt-1 text-sm text-slate-600">
          用于在基础运费之外叠加“规则性加价”。建议先用模板，再微调 JSON。
        </div>
      </div>

      <SurchargeCreateForm disabled={disabled} onCreate={onCreate} onError={onError} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-800">附加费列表（可停用/删除）</div>
        <div className="mt-3">
          <SurchargeList list={detail.surcharges ?? []} disabled={disabled} onToggle={onToggle} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};
