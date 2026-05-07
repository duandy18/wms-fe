import React, { useEffect, useMemo, useState } from "react";
import {
  fetchInboundReceiptDetail,
  fetchInboundReceiptProgress,
} from "../api/inboundReceiptsApi";
import {
  formatInboundSourceType,
  formatInboundStatus,
  type InboundReceiptLineReadOut,
  type InboundReceiptProgressOut,
  type InboundReceiptReadOut,
} from "../contracts/inboundReceipt";

import { formatDateTimeMinute } from "../../../lib/dateTime";
function formatDateTime(value: string | null): string {
  return formatDateTimeMinute(value);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export const InboundReceiptInlineDetail: React.FC<{
  receiptId: number;
}> = ({ receiptId }) => {
  const [detail, setDetail] = useState<InboundReceiptReadOut | null>(null);
  const [progress, setProgress] = useState<InboundReceiptProgressOut | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [detailResp, progressResp] = await Promise.all([
          fetchInboundReceiptDetail(receiptId),
          fetchInboundReceiptProgress(receiptId),
        ]);
        if (!alive) return;
        setDetail(detailResp);
        setProgress(progressResp);
      } catch (err) {
        if (!alive) return;
        setDetail(null);
        setProgress(null);
        setError(getErrorMessage(err, "加载入库单详情失败"));
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [receiptId]);

  const progressByLineNo = useMemo(() => {
    const map = new Map<number, { received_qty: string; remaining_qty: string }>();
    for (const row of progress?.lines ?? []) {
      map.set(row.line_no, {
        received_qty: row.received_qty,
        remaining_qty: row.remaining_qty,
      });
    }
    return map;
  }, [progress]);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        正在加载详情…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
        未找到入库单详情。
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <div className="text-xs text-slate-500">任务号</div>
          <div className="font-mono text-sm text-slate-900">{detail.receipt_no}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">来源</div>
          <div className="text-sm text-slate-900">{formatInboundSourceType(detail.source_type)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">来源单号</div>
          <div className="text-sm text-slate-900">{detail.source_doc_no_snapshot || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">状态</div>
          <div className="text-sm text-slate-900">{formatInboundStatus(detail.status)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">仓库</div>
          <div className="text-sm text-slate-900">
            {detail.warehouse_name_snapshot || `仓库 ${detail.warehouse_id}`}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">对方</div>
          <div className="text-sm text-slate-900">{detail.counterparty_name_snapshot || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">发布时间</div>
          <div className="text-sm text-slate-900">{formatDateTime(detail.released_at)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">备注</div>
          <div className="text-sm text-slate-900">{detail.remark || "-"}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
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
            {detail.lines.map((line: InboundReceiptLineReadOut) => {
              const hit = progressByLineNo.get(line.line_no);
              return (
                <tr key={line.id} className="text-slate-800">
                  <td className="px-3 py-2 font-mono">{line.line_no}</td>
                  <td className="px-3 py-2">{line.item_name_snapshot || `商品 ${line.item_id}`}</td>
                  <td className="px-3 py-2">{line.item_spec_snapshot || "-"}</td>
                  <td className="px-3 py-2">{line.uom_name_snapshot || "-"}</td>
                  <td className="px-3 py-2 text-right font-mono">{line.planned_qty}</td>
                  <td className="px-3 py-2 text-right font-mono">{hit?.received_qty ?? "0"}</td>
                  <td className="px-3 py-2 text-right font-mono">
                    {hit?.remaining_qty ?? line.planned_qty}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
