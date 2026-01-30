// src/features/admin/shipping-providers/scheme/table/cards/PriceTablePreviewCard.tsx

import React from "react";

export const PriceTablePreviewCard: React.FC<{
  title: string;
  selectedZoneId: number | null;
  rows: Array<{ seg: string; value: string }>;
}> = (p) => {
  const { title, selectedZoneId, rows } = p;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <div className="text-base font-semibold text-slate-900">价格表预览</div>
        <div className="mt-1 text-sm text-slate-600">只读摘要，便于快速核对“当前 Zone 的各段是否已录价”。</div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-600">
          当前 Zone：<span className="font-mono">{selectedZoneId ? `zone_id=${selectedZoneId}` : "未选择"}</span>
        </div>

        {rows.length === 0 ? (
          <div className="mt-3 text-sm text-slate-600">暂无可展示的段结构或未选择 Zone。</div>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="min-w-[520px] w-full text-sm">
              <thead>
                <tr className="text-slate-700">
                  <th className="text-left py-2 pr-3">重量段</th>
                  <th className="text-left py-2 pr-3">录价状态</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.seg} className="border-t border-slate-200">
                    <td className="py-2 pr-3 text-slate-700">{r.seg}</td>
                    <td className="py-2 pr-3 text-slate-900">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceTablePreviewCard;
