// src/features/admin/shipping-providers/scheme/surcharges/create/BulkyFeeSectionCard.tsx

import React, { useEffect, useMemo, useState } from "react";
import type { PricingSchemeSurcharge } from "../../../api";
import { UI } from "../../ui";
import { findBulkySurcharge, readAmt, toNum } from "./surchargeCreateUtils";

export function BulkyFeeSectionCard(props: {
  existingSurcharges: PricingSchemeSurcharge[];
  disabled?: boolean;

  onCreate: (payload: {
    name: string;
    priority: number;
    condition_json: Record<string, unknown>;
    amount_json: Record<string, unknown>;
  }) => Promise<void>;

  onPatch: (
    surchargeId: number,
    payload: Partial<{
      name: string;
      priority: number;
      active: boolean;
      condition_json: Record<string, unknown>;
      amount_json: Record<string, unknown>;
    }>,
  ) => Promise<void>;

  onError: (msg: string) => void;
}) {
  const { existingSurcharges, disabled, onCreate, onPatch, onError } = props;

  const existing = useMemo(() => (Array.isArray(existingSurcharges) ? existingSurcharges : []), [existingSurcharges]);
  const bulkyExisting = useMemo(() => findBulkySurcharge(existing), [existing]);

  const [bulkyEditing, setBulkyEditing] = useState(true);
  const [bulkyEnabled, setBulkyEnabled] = useState(false);
  const [bulkyAmountText, setBulkyAmountText] = useState("2.0");

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
        priority: 100,
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
    <div className={UI.surchargeSectionCard}>
      <div className={UI.surchargeBulkyHeaderRow}>
        <div>
          <div className={UI.sectionTitle}>异形件操作费</div>
          <div className={`mt-1 ${UI.panelHint}`}>用于 bulky / irregular。命中由作业台 flags 触发。</div>
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

      <div className={UI.surchargeBulkyGrid}>
        <div className={UI.surchargeBulkyToggleCol}>
          <input
            type="checkbox"
            checked={bulkyEnabled}
            disabled={disabled || !bulkyEditing}
            onChange={(e) => setBulkyEnabled(e.target.checked)}
          />
          <span className={UI.surchargeBulkyToggleText}>启用异形件操作费</span>
        </div>

        <div className={UI.surchargeBulkyAmountCol}>
          <label className={UI.helpText}>每单加价（元）</label>
          <input
            className={UI.inputMono}
            value={bulkyAmountText}
            disabled={disabled || !bulkyEditing || !bulkyEnabled}
            onChange={(e) => setBulkyAmountText(e.target.value)}
            placeholder="例如：2.0"
          />
        </div>
      </div>

      {!bulkyEnabled ? <div className={UI.surchargeBulkyDisabledHint}>当前未启用，不会生成/更新任何异形件规则。</div> : null}
    </div>
  );
}

export default BulkyFeeSectionCard;
