// src/features/admin/shipping-providers/scheme/surcharges/create/SelectedScopePriceTable.tsx

import React from "react";
import { UI } from "../../ui";

export type ScopeRow = {
  id: string;
  scope: "province" | "city";
  label: string; // 省：广东省；城市：深圳市（不带省前缀）
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
  amountLabel = "单票加价（元）",
  emptyText = "暂无已保存的省/城市。请先在第一/第二部分选择后点击“保存”。",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div className="mt-1 text-sm text-slate-600">
            规则：省=全省收费；城市=省内点名收费（该省其他地区不收）。金额只在此表逐行填写。
          </div>
        </div>
        <div className="text-sm text-slate-600">
          已选：<span className="font-mono">{rows.length}</span>
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
                      placeholder="例如：0.3"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-2 text-xs text-slate-500">
            金额必须是 <span className="font-mono">&gt;=0</span> 的数字。这里每一行会生成一条附加费记录。
          </div>
        </div>
      )}
    </div>
  );
};
