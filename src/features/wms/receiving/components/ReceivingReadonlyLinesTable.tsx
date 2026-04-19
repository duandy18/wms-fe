import React from "react";
import type { ReceivingTaskLineOut } from "../contracts/receiving";
import { formatQty } from "../utils/fixedRows";

type Props = {
  lines: ReceivingTaskLineOut[];
};

const ReceivingReadonlyLinesTable: React.FC<Props> = ({ lines }) => {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-semibold text-slate-900">收货行（当前情况）</div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">行号</th>
              <th className="px-3 py-2 text-left">商品</th>
              <th className="px-3 py-2 text-left">规格</th>
              <th className="px-3 py-2 text-left">单位</th>
              <th className="px-3 py-2 text-right">任务数量</th>
              <th className="px-3 py-2 text-right">累计已收</th>
              <th className="px-3 py-2 text-right">剩余待收</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  暂无收货行
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.line_no} className="text-slate-800">
                  <td className="px-3 py-2 font-mono">{line.line_no}</td>
                  <td className="px-3 py-2">
                    {line.item_name_snapshot || `商品 ${line.item_id}`}
                  </td>
                  <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                  <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatQty(line.planned_qty)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatQty(line.received_qty)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono">
                    {formatQty(line.remaining_qty)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ReceivingReadonlyLinesTable;
