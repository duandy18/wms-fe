// src/features/admin/shipping-providers/scheme/surcharges/SurchargeCreateForm.tsx

import React from "react";
import type { PricingSchemeSurcharge } from "../../api";
import { SurchargeCreateCard } from "./create/SurchargeCreateCard";

export const SurchargeCreateForm: React.FC<{
  schemeId: number;
  existingSurcharges: PricingSchemeSurcharge[];

  disabled?: boolean;

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

  onError: (msg: string) => void;
}> = ({ schemeId, existingSurcharges, disabled, onCreate, onPatch, onError }) => {
  return (
    <SurchargeCreateCard
      schemeId={schemeId}
      existingSurcharges={existingSurcharges}
      disabled={disabled}
      onCreate={onCreate}
      onPatch={onPatch}
      onError={onError}
    />
  );
};
