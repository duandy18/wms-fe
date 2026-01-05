// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard_impl/index.tsx

import React, { useMemo, useState } from "react";
import type { PricingSchemeZoneBracket } from "../../../api";
import { UI } from "../../ui";
import type { RowDraft, CellMode } from "../quoteModel";
import { defaultDraft, draftFromBracket, keyFromBracket, segLabel } from "../quoteModel";

import type { ZoneEntryCardProps } from "./types";
import { backendStatusZh, editingStatusZh, modeLabelZh } from "./status";
import { normalizeInput, resetDraftForMode } from "./draft";

function statusClass(tone: "ok" | "empty" | "warn"): string {
  if (tone === "ok") return "text-emerald-700";
  if (tone === "empty") return "text-slate-400";
  return "text-red-600";
}

export const ZoneEntryCard: React.FC<ZoneEntryCardProps> = ({
  busy,
  selectedZoneId,
  tableRows,
  currentDrafts,
  currentBrackets,
  onSetDraft,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const locked = !editing;

  const bracketByKey = useMemo(() => {
    const m: Record<string, PricingSchemeZoneBracket> = {};
    for (const b of currentBrackets ?? []) m[keyFromBracket(b)] = b;
    return m;
  }, [currentBrackets]);

  const stats = useMemo(() => {
    let invalid = 0;
    let ok = 0;
    for (const r of tableRows) {
      if (r.key) ok += 1;
      else invalid += 1;
    }
    return { ok, invalid };
  }, [tableRows]);

  async function handleSave() {
    if (!selectedZoneId) return;
    await onSave();
    setEditing(false);
  }

  return (
    <div className={UI.cardTight}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={UI.sectionTitle}>当前区域价格录入（批量）</div>
          <div className="mt-1 text-xs text-slate-500">
            {stats.ok} 行可录价{stats.invalid ? `，${stats.invalid} 行区间非法` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              editing
                ? "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100"
            }`}
            disabled={!selectedZoneId || busy}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "退出编辑" : "编辑"}
          </button>

          <button
            type="button"
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              editing && selectedZoneId && !busy
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-200 bg-slate-100 text-slate-400"
            }`}
            disabled={!editing || !selectedZoneId || busy}
            onClick={() => void handleSave()}
          >
            保存
          </button>
        </div>
      </div>

      {!selectedZoneId ? (
        <div className={`mt-3 ${UI.helpText}`}>请先选择区域</div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">重量区间</th>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">计价方式</th>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">金额 / 首重费</th>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">首重重量</th>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">续重单价</th>
                <th className="border-b px-3 py-2 text-left text-sm text-slate-500">状态</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, idx) => {
                const k = row.key;
                const invalid = !k;

                const backend = !invalid && k ? bracketByKey[k] : undefined;

                const d: RowDraft = invalid
                  ? defaultDraft()
                  : locked
                    ? backend
                      ? draftFromBracket(backend)
                      : defaultDraft()
                    : currentDrafts[k!] ?? (backend ? draftFromBracket(backend) : defaultDraft());

                const disabled = busy || invalid || locked;

                const st = invalid
                  ? { text: "非法", tone: "warn" as const }
                  : locked
                    ? backendStatusZh(backend)
                    : editingStatusZh({ draft: d, backend });

                const label = invalid ? "" : d.mode === "manual" ? "需补录" : modeLabelZh(d.mode);

                return (
                  <tr key={k ?? idx} className="border-b">
                    <td className="px-3 py-3 text-sm font-mono text-slate-800">
                      {segLabel(row.segment)}
                      {invalid ? <span className="ml-2 text-xs text-red-600">区间非法</span> : null}
                    </td>

                    <td className="px-3 py-3">
                      {invalid ? (
                        <span className="text-sm text-slate-400">—</span>
                      ) : d.mode === "manual" ? (
                        <span className="text-sm text-red-600">需补录</span>
                      ) : (
                        <select
                          className={`w-36 rounded border px-2 py-1 text-sm ${
                            disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                          }`}
                          value={d.mode}
                          disabled={disabled}
                          onChange={(e) => {
                            if (!k) return;
                            const nextMode = e.target.value as CellMode;
                            const next = resetDraftForMode(d, nextMode);
                            onSetDraft(k, next);
                          }}
                        >
                          <option value="linear_total">票费 + 单价</option>
                          <option value="step_over">首重 / 续重</option>
                          <option value="flat">固定价</option>
                        </select>
                      )}

                      {!invalid ? <span className="ml-2 text-xs text-slate-500">{label}</span> : null}
                    </td>

                    <td className="px-3 py-3">
                      <input
                        className={`w-28 rounded border px-2 py-1 text-sm font-mono ${
                          disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                        }`}
                        disabled={disabled || d.mode === "manual"}
                        value={d.mode === "flat" ? d.flatAmount : d.baseAmount}
                        onChange={(e) => {
                          if (!k) return;
                          const v = normalizeInput(e.target.value);
                          if (d.mode === "flat") onSetDraft(k, { mode: "flat", flatAmount: v });
                          else if (d.mode === "linear_total") onSetDraft(k, { mode: "linear_total", baseAmount: v });
                          else if (d.mode === "step_over") onSetDraft(k, { mode: "step_over", baseAmount: v });
                        }}
                      />
                    </td>

                    <td className="px-3 py-3">
                      {d.mode === "step_over" ? (
                        <input
                          className={`w-20 rounded border px-2 py-1 text-sm font-mono ${
                            disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                          }`}
                          disabled={disabled}
                          value={d.baseKg}
                          onChange={(e) => {
                            if (!k) return;
                            onSetDraft(k, { mode: "step_over", baseKg: normalizeInput(e.target.value) });
                          }}
                        />
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {d.mode === "flat" || d.mode === "manual" ? (
                        <span className="text-sm text-slate-400">—</span>
                      ) : (
                        <input
                          className={`w-28 rounded border px-2 py-1 text-sm font-mono ${
                            disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                          }`}
                          disabled={disabled}
                          value={d.ratePerKg}
                          onChange={(e) => {
                            if (!k) return;
                            const v = normalizeInput(e.target.value);
                            if (d.mode === "linear_total") onSetDraft(k, { mode: "linear_total", ratePerKg: v });
                            else if (d.mode === "step_over") onSetDraft(k, { mode: "step_over", ratePerKg: v });
                          }}
                        />
                      )}
                    </td>

                    <td className={`px-3 py-3 text-sm ${statusClass(st.tone)}`}>{st.text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ZoneEntryCard;
