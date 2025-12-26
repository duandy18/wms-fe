// src/features/admin/shipping-providers/scheme/brackets/SegmentPricingPriceInputs.tsx
//
// ④ 输入价格（UI 子组件）
// - 仅负责输入框渲染与 draft 更新
// - 不做保存、不做确认

import React from "react";
import type { RowDraft } from "./quoteModel";
import type { PUI as PUIType } from "./ui";
import type { CellMode } from "./SegmentPricingForm/utils";

export const SegmentPricingPriceInputs: React.FC<{
  mode: CellMode;
  draft: RowDraft;
  setDraft: React.Dispatch<React.SetStateAction<RowDraft>>;
  canWrite: boolean;
  busy: boolean;
  PUI: typeof PUIType;
}> = ({ mode, draft, setDraft, canWrite, busy, PUI }) => {
  if (mode === "manual_quote") {
    return (
      <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
        当前选择：人工/未设（保存后该重量段将按 manual_quote 记录，不参与结构化算价）。
      </div>
    );
  }

  if (mode === "flat") {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <div className={PUI.inlineLabel}>固定价（元）</div>
        <input
          className={`${PUI.formInputMono} w-40`}
          placeholder="例如 8.00"
          value={draft.flatAmount}
          disabled={!canWrite || busy}
          onChange={(e) => setDraft((p) => ({ ...p, flatAmount: e.target.value }))}
        />
      </div>
    );
  }

  if (mode === "linear_total") {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <div className={PUI.inlineLabel}>票费（元）</div>
        <input
          className={`${PUI.formInputMono} w-40`}
          placeholder="例如 3.00"
          value={draft.baseAmount}
          disabled={!canWrite || busy}
          onChange={(e) => setDraft((p) => ({ ...p, baseAmount: e.target.value }))}
        />
        <div className={PUI.inlineLabel}>单价（元/kg）</div>
        <input
          className={`${PUI.formInputMono} w-40`}
          placeholder="例如 1.20"
          value={draft.ratePerKg}
          disabled={!canWrite || busy}
          onChange={(e) => setDraft((p) => ({ ...p, ratePerKg: e.target.value }))}
        />
      </div>
    );
  }

  // step_over
  return (
    <div className="mt-1 flex flex-wrap items-center gap-3">
      <div className={PUI.inlineLabel}>首重（kg）</div>
      <input
        className={`${PUI.formInputMono} w-28`}
        placeholder="例如 1"
        value={draft.baseKg}
        disabled={!canWrite || busy}
        onChange={(e) => setDraft((p) => ({ ...p, baseKg: e.target.value }))}
      />
      <div className={PUI.inlineLabel}>首重价（元）</div>
      <input
        className={`${PUI.formInputMono} w-40`}
        placeholder="例如 5.00"
        value={draft.baseAmount}
        disabled={!canWrite || busy}
        onChange={(e) => setDraft((p) => ({ ...p, baseAmount: e.target.value }))}
      />
      <div className={PUI.inlineLabel}>续重单价（元/kg）</div>
      <input
        className={`${PUI.formInputMono} w-40`}
        placeholder="例如 1.00"
        value={draft.ratePerKg}
        disabled={!canWrite || busy}
        onChange={(e) => setDraft((p) => ({ ...p, ratePerKg: e.target.value }))}
      />
    </div>
  );
};

export default SegmentPricingPriceInputs;
