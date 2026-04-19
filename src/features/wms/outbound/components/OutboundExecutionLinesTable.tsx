import React from "react";

export interface OutboundExecutionLineRow {
  key: string | number;
  refLabel: string;
  itemId: number;
  plannedQty: number;
  qtyValue: string;
  hint: string;
}

type Props = {
  refColumnLabel: string;
  lines: OutboundExecutionLineRow[];
  onChangeQty: (key: number, value: string) => void;
  emptyText: string;
};

const OutboundExecutionLinesTable: React.FC<Props> = ({
  refColumnLabel,
  lines,
  onChangeQty,
  emptyText,
}) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left">{refColumnLabel}</th>
            <th className="px-3 py-2 text-left">item_id</th>
            <th className="px-3 py-2 text-right">需求/申请数量</th>
            <th className="px-3 py-2 text-right">本次出库</th>
            <th className="px-3 py-2 text-left">扫码/命中</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                {emptyText}
              </td>
            </tr>
          ) : (
            lines.map((line) => (
              <tr key={String(line.key)} className="text-slate-800">
                <td className="px-3 py-2 font-mono">{line.refLabel}</td>
                <td className="px-3 py-2 font-mono">{line.itemId}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {line.plannedQty}
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    className="w-28 rounded-md border border-slate-300 px-3 py-1.5 text-right text-sm"
                    value={line.qtyValue}
                    onChange={(e) => onChangeQty(Number(line.key), e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">{line.hint}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OutboundExecutionLinesTable;
