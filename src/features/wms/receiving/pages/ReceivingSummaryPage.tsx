import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import ReceivingInlineDetail from "../components/ReceivingInlineDetail";
import {
  formatReceivingSourceType,
  formatReceivingStatus,
} from "../contracts/receiving";
import { useReceivingSummaryPage } from "../model/useReceivingSummaryPage";
import { formatQty } from "../utils/fixedRows";

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
}

const ReceivingSummaryPage: React.FC = () => {
  const m = useReceivingSummaryPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="收货汇总"
        description="展示全部已发布收货单的实际收货情况；点击行内展开，查看当前收货单与收货行进度。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            当前页只展示收货情况汇总，不在此页创建收货单据。
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
                <th className="px-3 py-2 text-left">收货单号</th>
                <th className="px-3 py-2 text-left">来源</th>
                <th className="px-3 py-2 text-left">来源单号</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">对方</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">发布时间</th>
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
                    正在加载收货汇总…
                  </td>
                </tr>
              ) : m.rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-8 text-center text-slate-500">
                    暂无已发布收货单
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => (
                  <React.Fragment key={row.receipt_id}>
                    <tr className="text-slate-800">
                      <td className="px-3 py-2 font-mono">{row.receipt_no}</td>
                      <td className="px-3 py-2">{formatReceivingSourceType(row.source_type)}</td>
                      <td className="px-3 py-2">{row.source_doc_no_snapshot || "-"}</td>
                      <td className="px-3 py-2">
                        {row.warehouse_name_snapshot || `仓库 ${row.warehouse_id}`}
                      </td>
                      <td className="px-3 py-2">{row.counterparty_name_snapshot || "-"}</td>
                      <td className="px-3 py-2">{formatReceivingStatus(row.status)}</td>
                      <td className="px-3 py-2">{formatDateTime(row.released_at)}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.line_count}</td>
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
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                          onClick={() => {
                            void m.toggleExpand(row.receipt_no);
                          }}
                        >
                          {m.expandedReceiptNo === row.receipt_no ? "收起" : "查看"}
                        </button>
                      </td>
                    </tr>

                    {m.expandedReceiptNo === row.receipt_no ? (
                      <tr>
                        <td colSpan={12} className="bg-white px-3 py-3">
                          <ReceivingInlineDetail
                            detail={m.detailByReceiptNo[row.receipt_no] ?? null}
                            loading={Boolean(m.detailLoadingByReceiptNo[row.receipt_no])}
                            error={m.detailErrorByReceiptNo[row.receipt_no] ?? ""}
                          />
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

export default ReceivingSummaryPage;
