import React, { useState } from "react";
import { InboundReceiptInlineDetail } from "./InboundReceiptInlineDetail";
import PageTitle from "../../../components/ui/PageTitle";
import type { InboundReceiptSourceType } from "../contracts/inboundReceipt";
import {
  formatInboundSourceType,
  formatInboundStatus,
} from "../contracts/inboundReceipt";
import { useInboundReceiptsPage } from "../model/useInboundReceiptsPage";

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

function formatQty(value: string | number | null | undefined): string {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isFinite(n)) return String(n);
  return String(value);
}

type Props = {
  title: string;
  description: string;
  sourceType?: InboundReceiptSourceType;
  showTitle?: boolean;
};

const InboundReceiptsPageShell: React.FC<Props> = ({
  title,
  description,
  sourceType,
  showTitle = true,
}) => {
  const m = useInboundReceiptsPage(sourceType);
  const [expandedReceiptId, setExpandedReceiptId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {showTitle ? <PageTitle title={title} description={description} /> : null}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            当前页负责入库单汇总与行内展开详情；创建动作按来源页分别承接。
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
            onClick={m.reload}
            disabled={m.loading}
          >
            {m.loading ? "刷新中…" : "刷新"}
          </button>
        </div>

        {m.error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {m.error}
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">任务号</th>
                <th className="px-3 py-2 text-left">来源</th>
                <th className="px-3 py-2 text-left">来源单号</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">对方</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">最近收货时间</th>
                <th className="px-3 py-2 text-right">行数</th>
                <th className="px-3 py-2 text-right">任务数量</th>
                <th className="px-3 py-2 text-right">累计已收</th>
                <th className="px-3 py-2 text-right">剩余待收</th>
                <th className="px-3 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {m.loading ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                    正在加载入库单列表...
                  </td>
                </tr>
              ) : m.rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                    暂无入库单
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr className="text-slate-800">
                      <td className="px-3 py-2 font-mono">{row.receipt_no}</td>
                      <td className="px-3 py-2">
                        {formatInboundSourceType(row.source_type)}
                      </td>
                      <td className="px-3 py-2">{row.source_doc_no_snapshot || "-"}</td>
                      <td className="px-3 py-2">
                        {row.warehouse_name_snapshot || `仓库 ${row.warehouse_id}`}
                      </td>
                      <td className="px-3 py-2">
                        {row.counterparty_name_snapshot || "-"}
                      </td>
                      <td className="px-3 py-2">{formatInboundStatus(row.status)}</td>
                      <td className="px-3 py-2">
                        {formatDateTime(row.last_operated_at)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.line_count}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(row.total_planned_qty)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(row.total_received_qty)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {formatQty(row.total_remaining_qty)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                            onClick={() => {
                              setExpandedReceiptId((prev) =>
                                prev === row.id ? null : row.id,
                              );
                            }}
                          >
                            {expandedReceiptId === row.id ? "收起" : "查看"}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedReceiptId === row.id ? (
                      <tr>
                        <td colSpan={12} className="bg-white px-3 py-3">
                          <InboundReceiptInlineDetail receiptId={row.id} />
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default InboundReceiptsPageShell;
