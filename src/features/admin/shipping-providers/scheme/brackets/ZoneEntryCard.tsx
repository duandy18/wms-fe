// src/features/admin/shipping-providers/scheme/brackets/ZoneEntryCard.tsx
//
// 当前区域录价（批量录入）
// - 默认锁定：避免误操作改价
// - 点“编辑”才允许输入
// - 保存成功后自动锁定
//
// 口径：
// - fixed 段：固定价（flat）
// - 其余段：票费（每票固定） + 总重量(kg) × 单价(元/kg)
// - 不让用户选择“模型/旧口径”
// - 用户只填数字，系统按已有 bracket 的 pricing_mode 自动呈现输入控件
//
// 交互要求（本轮）
// - 所有可编辑数值字段（固定价 / 票费 / 元/kg）默认值统一为 "0"
// - 禁止出现：有的行能输入、有的行显示空白；保存后回显“像丢数据”
// - 保存 payload 仍以 pricing_mode 为真相：flat 只写 flat_amount；linear_total 只写 base_amount+rate_per_kg
// - 本卡为了“统一输入体验”，flat 行也显示/允许编辑“元/kg”（但不会写回后端）

import React, { useState } from "react";
import { UI } from "../ui";
import type { WeightSegment } from "./PricingRuleEditor";
import type { RowDraft } from "./quoteModel";
import { segLabel, defaultDraft } from "./quoteModel";

function displayNum(v: string): string {
  const t = (v ?? "").trim();
  return t ? t : "0";
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
            提示：固定价段显示“金额”；线性段显示
            <span className="font-mono">票费 + 总重量(kg) × 单价(元/kg)</span>。为避免误操作，本卡默认锁定；需要批量调整请点“编辑”。日常小幅改价建议用底部“快递公司报价表”的单元格 ✏️。
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
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">重量区间</th>
                <th className="border-b px-3 py-2 text-left text-xs text-slate-500">金额/票费</th>
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

                return (
                  <tr key={k ?? idx} className="border-b">
                    <td className="px-3 py-3 text-sm font-mono text-slate-800">
                      {segLabel(row.segment)}
                      {invalid ? <span className="ml-2 text-xs text-red-600">（区间非法）</span> : null}
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
                          value={displayNum(isFlat ? d.flatAmount : d.baseAmount)}
                          disabled={disabled}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (!k) return;
                            if (isFlat) onSetDraft(k, { mode: "flat", flatAmount: v });
                            else onSetDraft(k, { mode: "linear_total", baseAmount: v });
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
                          value={displayNum(d.ratePerKg)}
                          disabled={disabled}
                          onChange={(e) => {
                            if (!k) return;
                            const v = e.target.value;
                            // UI 统一：flat 行也允许填写单价（但不会写回后端；保存 payload 严格按 pricing_mode）
                            if (isFlat) onSetDraft(k, { mode: "flat", ratePerKg: v });
                            else onSetDraft(k, { mode: "linear_total", ratePerKg: v });
                          }}
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
            <div className="mt-2 text-xs text-slate-500">当前为锁定状态，点右上角“编辑”后才能修改；保存后会自动锁定。</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ZoneEntryCard;
