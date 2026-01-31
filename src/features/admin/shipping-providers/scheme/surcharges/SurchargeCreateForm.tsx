// src/features/admin/shipping-providers/scheme/surcharges/SurchargeCreateForm.tsx

import React, { useState } from "react";
import type { PricingSchemeSurcharge } from "../../api";
import { UI } from "../ui";
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
  const [open, setOpen] = useState(false);

  return (
    <div className={UI.cardTight}>
      <div className="flex items-start justify-between gap-3">
        <div className={UI.sectionTitle}>批量工具（高级）</div>
        <button
          type="button"
          className={UI.btnNeutralSm}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "折叠" : "展开"}
        </button>
      </div>

      {open ? (
        <div className="mt-3">
          <SurchargeCreateCard
            schemeId={schemeId}
            existingSurcharges={existingSurcharges}
            disabled={disabled}
            onCreate={onCreate}
            onPatch={onPatch}
            onError={onError}
          />
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-600">
          用于一次性批量生成/更新多条附加费规则（写入后端）。日常新增请优先使用上方“新增省或市（写入）”。
        </div>
      )}
    </div>
  );
};
