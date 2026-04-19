import React from "react";
import PageTitle from "../../../../components/ui/PageTitle";
import OutboundSummaryInlineDetail from "../components/OutboundSummaryInlineDetail";
import {
  formatDateTime,
  formatOutboundSourceType,
  formatOutboundStatus,
} from "../contracts/outbound";
import { useOutboundSummaryPage } from "../model/useOutboundSummaryPage";

const OutboundSummaryPage: React.FC = () => {
  const m = useOutboundSummaryPage();

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="出库汇总"
        description="展示真实 OUTBOUND 事件列表；点击行内展开，查看当前事件头与事件行明细。"
      />

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            当前页只展示出库事件汇总，不在此页执行出库提交。
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
                <th className="px-3 py-2 text-left">事件号</th>
                <th className="px-3 py-2 text-left">来源</th>
                <th className="px-3 py-2 text-left">来源单号</th>
                <th className="px-3 py-2 text-left">仓库</th>
                <th className="px-3 py-2 text-left">状态</th>
                <th className="px-3 py-2 text-left">提交时间</th>
                <th className="px-3 py-2 text-right">行数</th>
                <th className="px-3 py-2 text-right">本次出库数量</th>
                <th className="px-3 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {m.loading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                    正在加载出库汇总…
                  </td>
                </tr>
              ) : m.rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-slate-500">
                    暂无出库事件
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => (
                  <React.Fragment key={row.event_id}>
                    <tr className="text-slate-800">
                      <td className="px-3 py-2 font-mono">{row.event_no}</td>
                      <td className="px-3 py-2">
                        {formatOutboundSourceType(row.source_type)}
                      </td>
                      <td className="px-3 py-2">{row.source_ref || "-"}</td>
                      <td className="px-3 py-2">仓库 {row.warehouse_id}</td>
                      <td className="px-3 py-2">
                        {formatOutboundStatus(row.status)}
                      </td>
                      <td className="px-3 py-2">
                        {formatDateTime(row.committed_at)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.lines_count}
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        {row.total_qty_outbound}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                          onClick={() => {
                            void m.toggleExpand(row.event_id);
                          }}
                        >
                          {m.expandedEventId === row.event_id ? "收起" : "查看"}
                        </button>
                      </td>
                    </tr>

                    {m.expandedEventId === row.event_id ? (
                      <tr>
                        <td colSpan={9} className="bg-white px-3 py-3">
                          <OutboundSummaryInlineDetail
                            detail={m.detailByEventId[row.event_id] ?? null}
                            loading={Boolean(
                              m.detailLoadingByEventId[row.event_id],
                            )}
                            error={m.detailErrorByEventId[row.event_id] ?? ""}
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

export default OutboundSummaryPage;
