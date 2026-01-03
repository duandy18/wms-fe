// src/features/admin/shipping-providers/scheme/surcharges/SurchargesPanel.tsx

import React, { useState } from "react";
import type { PricingSchemeDetail, PricingSchemeSurcharge } from "../../api";
import { SurchargeCreateForm } from "./SurchargeCreateForm";
import { SurchargeList } from "./SurchargeList";
import { UI } from "../ui";

export const SurchargesPanel: React.FC<{
  detail: PricingSchemeDetail;
  disabled?: boolean;
  onError: (msg: string) => void;

  onCreate: (payload: {
    name: string;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;

  onPatch: (
    surchargeId: number,
    payload: Partial<{
      name: string;
      active: boolean;
      condition_json: Record<string, unknown>;
      amount_json: Record<string, unknown>;
    }>,
  ) => Promise<void>;

  onToggle: (s: PricingSchemeSurcharge) => Promise<void>;
  onDelete: (s: PricingSchemeSurcharge) => Promise<void>;
}> = ({ detail, disabled, onError, onCreate, onPatch, onToggle, onDelete }) => {
  const [listOpen, setListOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className={UI.cardTight}>
        <div className={UI.panelTitle}>附加费（Surcharge）维护</div>
        <div className={`mt-1 ${UI.panelHint}`}>
          对齐快递公司“备注红字”：目的地命中 → 单票加价。上面编辑器负责生成/更新，下面列表负责查看/停用/删除。
        </div>
      </div>

      <SurchargeCreateForm
        schemeId={detail.id}
        existingSurcharges={detail.surcharges ?? []}
        disabled={disabled}
        onCreate={onCreate}
        onPatch={onPatch}
        onError={onError}
      />

      <div className={UI.cardTight}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={UI.sectionTitle}>附加费列表（已生效规则，可停用/删除）</div>
            <div className="mt-1 text-sm text-slate-600">这里展示的是“已经写入系统、会参与算价”的条款清单。</div>
          </div>

          <button
            type="button"
            className={UI.btnNeutralSm}
            disabled={disabled}
            onClick={() => setListOpen((v) => !v)}
          >
            {listOpen ? "折叠" : "展开"}
          </button>
        </div>

        {listOpen ? (
          <div className="mt-3">
            <SurchargeList list={detail.surcharges ?? []} disabled={disabled} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ) : (
          <div className="mt-3 text-sm text-slate-600">已折叠</div>
        )}
      </div>
    </div>
  );
};
