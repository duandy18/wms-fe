// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard.tsx
//
// 当前区域录价（批量录入）
// - 默认锁定：避免误操作改价
// - 点“编辑”才允许输入
// - 保存成功后自动锁定
//
// 口径：
// - flat：固定价（flat_amount）
// - linear_total：票费（base_amount） + 单价（rate_per_kg）
// - manual_quote：不在本卡批量录入（应走核对表/单格录入或后续专门入口）
//
// 交互要求（本轮修正）
// - ✅ 空就是空：允许用户清空输入框（不会被强制变回 0）
// - ✅ 0 才是 0：只有用户输入 0 或后端真实值为 0 才显示 0
// - ✅ 保存 payload 仍以 pricing_mode 为真相：flat 只写 flat_amount；linear_total 只写 base_amount+rate_per_kg
// - ❌ 不再为了“统一体验”强行把空值显示成 0（那会造成顽固 0、无法清空、误以为已录价）
//
// 说明：
// - 本卡只负责“当前选中 Zone 的批量录入”
// - 表头结构（重量段）来自上方 rows；本卡不提供编辑入口

import React, { useMemo, useState } from "react";
import { UI } from "../ui";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { defaultDraft, segLabel } from "./quoteModel";

function isBlank(v: string | null | undefined): boolean {
  return (v ?? "").trim().length === 0;
}

// ✅ 展示层：空值显示为空；0 只有在真实为 "0" / "0.0" / "0.00"（或用户输入）时才显示
function displayNumOrBlank(v: string | null | undefined): string {
  const t = (v ?? "").trim();
  return t; // 空就空，不兜底 0
}

// ✅ 写入层：保留用户输入原样（允许 ""），由保存逻辑决定如何校验/提交
function normalizeInput(raw: string): string {
  // 不在这里做 Number() 或 parse，避免 “删空 -> 0” 回弹
  return raw;
}

export const ZoneEntryCard: React.FC<{
  busy: boolean;
  selectedZoneId: number | null;
  tableRows: { segment: WeightSegment; key: string | null }[];
  currentDrafts: Record<string, RowDraft>;
  onSetDraft: (key: string, patch: Partial<RowDraft>) => void;
  onSave: () => Promise<void>;
}> = ({ busy, selectedZoneId, tableRows, currentDrafts, onSetDraft, onSave }) => {
  // ✅ 默认锁定：必须点“编辑”才能修改
  const [editing, setEditing] = useState(false);
  const locked = !editing;

  const hasRows = tableRows.length > 0;

  const stats = useMemo(() => {
    let invalid = 0;
    let editable = 0;
    for (const r of tableRows) {
      if (!r.key) invalid += 1;
      else editable += 1;
    }
    return { invalid, editable };
  }, [tableRows]);

  async function handleSave() {
    if (!selectedZoneId) return;
    try {
      await onSave();
      // ✅ 保存成功后锁定
      setEditing(false);
    } catch {
      // onSave 内部一般会 alert；这里不重复弹窗
    }
  }

  return (
    <div className={UI.cardTight}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={UI.sectionTitle}>当前区域录价（批量录入）</div>

          <div className={`mt-1 ${UI.tinyHelpText}`}>
            提示：<span className="font-mono">flat</span> 段填写“金额”；<span className="font-mono">linear_total</span>{" "}
            段填写<span className="font-mono">票费 + 单价（元/kg）</span>。为避免误操作，本卡默认锁定；需要批量调整请点“编辑”。日常少量改价建议用底部“快递公司报价表”的单元格 ✏️。
          </div>

          <div className={`mt-1 ${UI.tinyHelpText}`}>
            当前：{stats.editable} 行可录价{stats.invalid ? `，${stats.invalid} 行区间非法（需先修正重量分段）` : ""}。
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
            title={editing ? "退出编辑（不保存）" : "进入编辑（允许批量修改）"}
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
            title={!editing ? "先点“编辑”再保存" : "保存并锁定"}
          >
            保存当前区域报价
          </button>
        </div>
      </div>

      {!selectedZoneId ? (
        <div className={`mt-3 ${UI.helpText}`}>请先在上方选择区域（Zone）。</div>
      ) : !hasRows ? (
        <div className={`mt-3 ${UI.helpText}`}>暂无重量分段（请先完善上方重量分段模板）。</div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">重量区间</th>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">金额 / 票费</th>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">单价（元/kg）</th>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">状态</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, idx) => {
                const k = row.key;
                const invalid = !k;

                // ✅ 避免 boolean | RowDraft
                const d: RowDraft = invalid ? defaultDraft() : (currentDrafts[k] ?? defaultDraft());

                const disabled = busy || invalid || locked;
                const isFlat = d.mode === "flat";
                const isLinear = d.mode === "linear_total";

                // 本行的“主金额字段”：flat -> flatAmount；linear_total -> baseAmount
                const mainValue = isFlat ? d.flatAmount : d.baseAmount;

                // rate_per_kg：仅对 linear_total 有意义，但我们允许用户暂存输入（不会影响 payload：由 buildPayloadFromDraft 决定）
                const rateValue = d.ratePerKg;

                const showModeBadge = isFlat ? "flat" : isLinear ? "linear_total" : "manual_quote";

                const mainIsEmpty = isBlank(mainValue);
                const rateIsEmpty = isBlank(rateValue);

                // 锁定态时，如果本行完全未录价，弱提示（但不强行显示 0）
                const lockedHint =
                  locked && !invalid && mainIsEmpty && rateIsEmpty ? <span className="ml-2 text-xs text-slate-400">（未录）</span> : null;

                return (
                  <tr key={k ?? idx} className="border-b">
                    <td className="px-3 py-3 text-sm font-mono text-slate-800">
                      {segLabel(row.segment)}
                      {invalid ? <span className="ml-2 text-xs text-red-600">（区间非法）</span> : null}
                      {!invalid ? <span className="ml-2 text-xs text-slate-400">[{showModeBadge}]</span> : null}
                      {lockedHint}
                    </td>

                    <td className="px-3 py-3">
                      {invalid ? (
                        <span className="text-xs text-red-600">请修正该重量分段</span>
                      ) : (
                        <input
                          className={`w-32 rounded border px-2 py-1 text-sm font-mono ${
                            disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                          }`}
                          placeholder={isFlat ? "金额" : "票费"}
                          value={displayNumOrBlank(mainValue)}
                          disabled={disabled}
                          onChange={(e) => {
                            if (!k) return;
                            const v = normalizeInput(e.target.value);

                            if (isFlat) {
                              onSetDraft(k, { mode: "flat", flatAmount: v });
                            } else if (isLinear) {
                              onSetDraft(k, { mode: "linear_total", baseAmount: v });
                            } else {
                              // manual_quote：保持模式，但允许暂存（不建议在本卡处理）
                              onSetDraft(k, { baseAmount: v });
                            }
                          }}
                        />
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {invalid ? (
                        <span className="text-xs text-red-600">—</span>
                      ) : (
                        <input
                          className={`w-32 rounded border px-2 py-1 text-sm font-mono ${
                            disabled ? "border-slate-200 bg-slate-100 text-slate-500" : "border-slate-300 bg-white"
                          }`}
                          placeholder="元/kg"
                          value={displayNumOrBlank(rateValue)}
                          disabled={disabled || isFlat} // ✅ flat 不需要 rate_per_kg：编辑态也禁用，避免误导
                          onChange={(e) => {
                            if (!k) return;
                            const v = normalizeInput(e.target.value);
                            onSetDraft(k, { mode: "linear_total", ratePerKg: v });
                          }}
                          title={isFlat ? "固定价（flat）不需要填写单价" : undefined}
                        />
                      )}
                    </td>

                    <td className="px-3 py-3 text-xs">
                      {busy ? (
                        <span className="text-slate-500">处理中…</span>
                      ) : invalid ? (
                        <span className="text-red-600">非法</span>
                      ) : locked ? (
                        <span className="text-slate-500">已锁定</span>
                      ) : (
                        <span className="text-emerald-700">可编辑</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {locked ? (
            <div className="mt-2 text-xs text-slate-500">
              当前为锁定状态，点右上角“编辑”后才能修改；保存后会自动锁定。空值表示未录入，不会被强制显示为 0。
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">
              编辑中：可清空输入框表示“未录入”。保存时若后端要求必填，将返回错误提示；请按需要补齐再保存。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ZoneEntryCard;
