// src/features/admin/shipping-providers/scheme/surcharges/cards/BulkyFeeCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeSurcharge } from "@/features/admin/shipping-providers/api";
import { UI } from "@/features/admin/shipping-providers/scheme/ui";
import { findBulkySurcharge, readAmt, toNum } from "@/features/admin/shipping-providers/scheme/surcharges/utils/surchargeUtils";

export const BulkyFeeCard: React.FC<{
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
}> = ({ existingSurcharges, disabled, onCreate, onPatch, onError }) => {
  const [bulkyEditing, setBulkyEditing] = useState(true);
  const [bulkyEnabled, setBulkyEnabled] = useState(false);
  const [bulkyAmountText, setBulkyAmountText] = useState("2.0");

  const bulkyExisting = useMemo(() => findBulkySurcharge(existingSurcharges), [existingSurcharges]);

  useEffect(() => {
    if (!bulkyExisting) return;

    const amt = readAmt(bulkyExisting);
    const kind = String(amt["kind"] ?? "flat").toLowerCase();
    if (kind !== "flat") return;

    const raw = amt["amount"];
    const a = typeof raw === "number" ? raw : Number(raw);

    setBulkyEnabled(!!bulkyExisting.active);
    if (Number.isFinite(a)) setBulkyAmountText(String(a));
    setBulkyEditing(false);
  }, [bulkyExisting]);

  const handleSaveBulky = async () => {
    if (bulkyEnabled) {
      const n = toNum(bulkyAmountText);
      if (n === null || n < 0) return onError("异形件操作费金额无效");

      const payload = {
        name: "异形件操作费",
        active: true,
        condition_json: { flag_any: ["bulky"] },
        amount_json: { kind: "flat", amount: n },
      };

      if (bulkyExisting) await onPatch(bulkyExisting.id, payload);
      else await onCreate(payload);
    } else {
      if (bulkyExisting) await onPatch(bulkyExisting.id, { active: false });
    }
    setBulkyEditing(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">异形件操作费</div>
          <div className="mt-1 text-sm text-slate-600">用于 bulky / irregular。命中由作业台 flags 触发。</div>
        </div>

        {bulkyEditing ? (
          <button type="button" className={UI.btnPrimaryGreen} disabled={disabled} onClick={() => void handleSaveBulky()}>
            保存
          </button>
        ) : (
          <button type="button" className={UI.btnNeutral} disabled={disabled} onClick={() => setBulkyEditing(true)}>
            修改
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-6">
        <div className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={bulkyEnabled}
            disabled={disabled || !bulkyEditing}
            onChange={(e) => setBulkyEnabled(e.target.checked)}
          />
          <span className="text-sm text-slate-700">启用异形件操作费</span>
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-sm text-slate-600">每单加价（元）</label>
          <input
            className={UI.inputMono}
            value={bulkyAmountText}
            disabled={disabled || !bulkyEditing || !bulkyEnabled}
            onChange={(e) => setBulkyAmountText(e.target.value)}
            placeholder="例如：2.0"
          />
        </div>
      </div>

      {!bulkyEnabled ? <div className="mt-2 text-sm text-slate-500">当前未启用，不会生成/更新任何异形件规则。</div> : null}
    </div>
  );
};
