// src/features/admin/shipping-providers/scheme/brackets/BracketLinearTotalParams.tsx
import React from "react";

export const BracketLinearTotalParams: React.FC<{
  disabled?: boolean;
  ticketFee: string;
  ratePerKg: string;
  onChangeTicketFee: (v: string) => void;
  onChangeRatePerKg: (v: string) => void;
}> = ({ disabled, ticketFee, ratePerKg, onChangeTicketFee, onChangeRatePerKg }) => {
  return (
    <>
      <div className="flex flex-col md:col-span-2">
        <label className="text-sm text-slate-600">票费（base_amount / 每票固定）</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={ticketFee}
          disabled={disabled}
          onChange={(e) => onChangeTicketFee(e.target.value)}
          placeholder="例如 0 / 1.2"
        />
      </div>

      <div className="flex flex-col md:col-span-2">
        <label className="text-sm text-slate-600">单价（rate_per_kg / 元每公斤）</label>
        <input
          className="mt-1 rounded-xl border border-slate-300 px-3 py-2 text-base font-mono"
          value={ratePerKg}
          disabled={disabled}
          onChange={(e) => onChangeRatePerKg(e.target.value)}
          placeholder="例如 1.0"
        />
      </div>

      <div className="md:col-span-2" />
    </>
  );
};
