// src/features/admin/shipping-providers/scheme/surcharges/create/SelectedScopePriceTable.tsx

import React from "react";
import { UI } from "../../ui";

export type ScopeRow = {
  id: string;
  scope: "province" | "city";
  label: string;
};

export const SelectedScopePriceTable: React.FC<{
  title: string;
  rows: ScopeRow[];
  amountById: Record<string, string>;
  onChangeAmount: (id: string, next: string) => void;
  disabled?: boolean;
  amountLabel?: string;
  emptyText?: string;
}> = ({
  title,
  rows,
  amountById,
  onChangeAmount,
  disabled,
  amountLabel = "金额（元）",
  emptyText = "—",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <div className="text-sm text-slate-600">
          条目：<span className="font-mono">{rows.length}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-3 text-sm text-slate-600">{emptyText}</div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-left text-sm font-semibold text-slate-700">
                <th className="px-3 py-2 w-[72px]">序号</th>
                <th className="px-3 py-2 w-[110px]">类型</th>
                <th className="px-3 py-2">范围</th>
                <th className="px-3 py-2 w-[220px]">{amountLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id} className="border-b border-slate-100 text-sm">
                  <td className="px-3 py-2 text-slate-700 font-mono">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-xl px-3 py-1 text-sm font-semibold ${
                        r.scope === "province" ? "bg-slate-100 text-slate-700" : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {r.scope === "province" ? "省" : "城市"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-900">{r.label}</td>
                  <td className="px-3 py-2">
                    <input
                      className={UI.inputMono}
                      value={amountById[r.id] ?? ""}
                      disabled={disabled}
                      onChange={(e) => onChangeAmount(r.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
