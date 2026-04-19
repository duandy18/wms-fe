import React from "react";
import type { OutboundSummaryDetailOut } from "../contracts/outbound";
import { formatDateTime } from "../contracts/outbound";

type Props = {
  detail: OutboundSummaryDetailOut | null;
  loading: boolean;
  error: string;
};

const OutboundSummaryInlineDetail: React.FC<Props> = ({
  detail,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        正在加载出库明细…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        暂无出库明细
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="mb-2 text-xs font-semibold tracking-wide text-slate-500">
          事件头参考
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <div className="text-xs text-slate-500">事件号</div>
            <div className="text-sm text-slate-900">{detail.event.event_no}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">来源</div>
            <div className="text-sm text-slate-900">
              {detail.event.source_type}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">来源单号</div>
            <div className="text-sm text-slate-900">
              {detail.event.source_ref || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">仓库</div>
            <div className="text-sm text-slate-900">
              仓库 {detail.event.warehouse_id}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">提交时间</div>
            <div className="text-sm text-slate-900">
              {formatDateTime(detail.event.committed_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">ref_line</th>
              <th className="px-3 py-2 text-left">商品</th>
              <th className="px-3 py-2 text-left">规格</th>
              <th className="px-3 py-2 text-left">item_id</th>
              <th className="px-3 py-2 text-left">lot_code</th>
              <th className="px-3 py-2 text-left">lot_id</th>
              <th className="px-3 py-2 text-right">本次出库</th>
              <th className="px-3 py-2 text-left">来源行</th>
              <th className="px-3 py-2 text-left">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {detail.lines.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-8 text-center text-slate-500"
                >
                  当前事件暂无行明细
                </td>
              </tr>
            ) : (
              detail.lines.map((line) => {
                const sourceLine =
                  line.order_line_id != null
                    ? `订单行 ${line.order_line_id}`
                    : line.manual_doc_line_id != null
                      ? `手动单据行 ${line.manual_doc_line_id}`
                      : "-";

                return (
                  <tr key={line.id} className="text-slate-800">
                    <td className="px-3 py-2 font-mono">{line.ref_line}</td>
                    <td className="px-3 py-2">
                      {line.item_name_snapshot || `商品 ${line.item_id}`}
                    </td>
                    <td className="px-3 py-2">
                      {line.item_spec_snapshot || "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">{line.item_id}</td>
                    <td className="px-3 py-2 font-mono">
                      {line.lot_code_snapshot || "-"}
                    </td>
                    <td className="px-3 py-2 font-mono">{line.lot_id}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {line.qty_outbound}
                    </td>
                    <td className="px-3 py-2">{sourceLine}</td>
                    <td className="px-3 py-2">{line.remark || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutboundSummaryInlineDetail;
