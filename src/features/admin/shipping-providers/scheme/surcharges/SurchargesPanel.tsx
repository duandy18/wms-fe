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
          <div className={UI.sectionTitle}>已写入规则</div>

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
        ) : null}
      </div>
    </div>
  );
};
